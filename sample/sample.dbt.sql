{{
  config(
    materialized='incremental',
    incremental_strategy='insert_overwrite',
    on_schema_change='append_new_columns',
    partition_by={'field': 'order_date', 'data_type': 'date'},
    cluster_by=['shop_id'],
    tags=['daily'],
    post_hook="grant select on {{ this }} to 'group:analysts'"
  )
}}

{#- Daily shop sales. Reloads the last days on incremental runs. -#}
{%- set paid_statuses = ['paid', 'shipped', 'delivered'] -%}
{%- set lookback_days = 3 if target.name == 'prod' else env_var('SHOP_LOOKBACK_DAYS', 30) -%}

{% macro cents_to_amount(column) -%}
  {{ return('round(safe_divide(' ~ column ~ ', 100), 2)') }}
{%- endmacro %}

{% set latest_order_query %}
  select max(order_date) from {{ this }}
{% endset %}

{% if execute and is_incremental() %}
  {% set latest_order_date = run_query(latest_order_query).columns[0][0] %}
  {% do log('Loading orders after ' ~ latest_order_date, info=true) %}
{% endif %}

with recursive category_tree as (
    select category_id, parent_id, 1 as depth
    from `shop-prod.catalog.categories`
    where parent_id is null
    union all
    select child.category_id, child.parent_id, category_tree.depth + 1
    from `shop-prod.catalog.categories` as child
    inner join category_tree on child.parent_id = category_tree.category_id
),

orders as (
    select
        * except (_loaded_at)
        replace (lower(trim(currency)) as currency),
        {{ dbt_utils.generate_surrogate_key(['shop_id', 'order_id']) }} as order_key,
        {{ to_local_date('ordered_at') }} as order_date,
        {{ cents_to_amount('total_cents') }} as total,
        safe_cast(json_value(payload, '$.coupon.percent') as float64) / 1e2 as discount,
        regexp_extract(order_note, r'gift card: (\d+)') as gift_card,
        starts_with(attachment, b'\x1f\x8b') as is_gzipped,
        `limit` as credit_limit  # noqa: RF04
    from {{ source('shop', 'orders') }} tablesample system (10 percent)
    where status in ('{{ paid_statuses | join("', '") }}')
      and order_note not like '%test%'
      and country not in ('AQ', 'BV')
      and shipped_at is distinct from cancelled_at
    {% if is_incremental() %}
      and ordered_at >= timestamp_sub(current_timestamp(), interval {{ lookback_days }} day)
    {% elif var('backfill_from', none) %}
      and ordered_at >= timestamp('{{ var("backfill_from") | trim }}')
    {% else %}
      and date(ordered_at) between '2020-01-01' and last_day(current_date())
    {% endif %}
    qualify row_number() over (partition by order_id order by updated_at desc nulls last) = 1
),

items as (
    select
        orders.order_key,
        item.sku,
        cast(item.quantity as int64) as quantity,
        struct(item.price as price, item.tax_rate as tax_rate) as pricing,
        array(select tag from unnest(item.tags) as tag where tag != '') as tags,
        st_geogfromgeojson(item.pickup_area, make_valid => true) as pickup_area
    from orders, unnest(orders.line_items) as item
),

/* One row per shop and day. */
daily as (
    select distinct
        orders.shop_id,
        orders.order_date,
        extract(isoweek from orders.order_date) as order_week,
        case orders.channel when 'app' then 'mobile' else 'web' end as channel_group,
        case
            when regexp_contains(orders.email, r'@example\.com$') then 'internal'
            when orders.customer_id is null then 'guest'
            else ifnull(nullif(orders.segment, ''), 'unknown')
        end as customer_type,
        countif(orders.total > 0.5) as paid_orders,
        sum(items.quantity) as items,
        sum(orders.total) as total,
        array_agg(orders.order_id order by orders.total desc)[safe_offset(0)] as top_order,
        logical_or(items.pricing.tax_rate = 0) as has_tax_free_items,
        any_value(if(orders.discount >= 0.25, "high", "low")) as discount_band,
        any_value(orders.shop_id || '-' || format('%05d', orders.order_number)) as sample_label,
        date_diff(current_date(), orders.order_date, day) as age_days
    from orders
    left outer join items using (order_key)
    where not exists (
        select 1 from {{ ref('blocked_customers') }} as blocked
        where blocked.customer_id = orders.customer_id
    )
    group by 1, 2, 3, 4, 5
),

calendar as (
    select shops.shop_id, calendar_date
    from {{ ref('stg_shop__shops') }} as shops
    cross join unnest(generate_date_array('2020-01-01', current_date())) as calendar_date
),

rolling as (
    select
        calendar.calendar_date,
        daily.*,
        sum(daily.items) over (by_shop rows between 6 preceding and current row) as items_7d,
        avg(daily.total) over (by_shop range between 13 preceding and current row) as total_14d,
        lag(daily.total) over by_shop as previous_total,
        first_value(daily.top_order ignore nulls) over by_shop as first_top_order,
        percentile_cont(daily.total, 0.5) over (partition by daily.shop_id) as median_total
    from calendar
    full join daily
        on daily.shop_id = calendar.shop_id
        and daily.order_date = calendar.calendar_date
    window by_shop as (partition by calendar.shop_id order by unix_date(calendar.calendar_date))
),

summary as (
    select
        shop_id,
        channel_group,
        grouping(channel_group) as is_total,
        {%- for status in paid_statuses %}
        countif(customer_type = '{{ status }}') as {{ status | replace('-', '_') }}_orders
        {%- if not loop.last %},{% endif %}
        {%- endfor %}
    from rolling
    group by cube (shop_id, channel_group)
    having count(*) >= 10
)

{% call audit_row_count('shop_sales_daily') %}
select * from summary
unpivot (order_count for status in (paid_orders, shipped_orders, delivered_orders))
union distinct
select shop_id, channel_group, false, sum(paid_orders), 'all'
from rolling
group by grouping sets ((shop_id, channel_group), (shop_id))
order by shop_id asc
limit 1000
{% endcall %}
