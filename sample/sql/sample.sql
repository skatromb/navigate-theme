/* Daily revenue per country, with a 7-day rolling average. */
create or replace view analytics.daily_revenue as
with paid_orders as (
    select
        orders.order_id,
        orders.customer_id,
        cast(orders.created_at as date) as order_date,
        orders.amount_cents / 100.0 as amount
    from raw.orders as orders
    where orders.status = 'paid'
      and orders.amount_cents > 0
      and orders.deleted_at is null
),

customers as (
    select
        customer_id,
        coalesce(country_code, 'unknown') as country,
        case
            when signup_source like 'ads_%' then 'paid'
            when signup_source in ('referral', 'partner') then 'referral'
            else 'organic'
        end as channel
    from raw.customers
    where not is_test_account
)

select
    paid_orders.order_date,
    customers.country,
    customers.channel,
    count(distinct paid_orders.customer_id) as buyers,
    sum(paid_orders.amount) as revenue,
    avg(sum(paid_orders.amount)) over (
        partition by customers.country
        order by paid_orders.order_date
        rows between 6 preceding and current row
    ) as revenue_7d_avg  -- rolling, not calendar
from paid_orders
left join customers on customers.customer_id = paid_orders.customer_id
group by 1, 2, 3
having sum(paid_orders.amount) >= 1000
order by paid_orders.order_date desc, revenue desc;
