# Orders sync

Loads orders into `analytics` every **15 minutes**, see [runbook](https://example.com).

## Setup

1. Install the [uv](https://docs.astral.sh/uv/) tool.
2. Run `make sync`, it is _safe_ to rerun.

- Logs go to `logs/sync.log`.
- ~~Cron~~ Orchestrator schedules the job.

### Known issues

> Late orders arrive after midnight, so the daily totals change once.

```
make sync DATE=2026-11-23
```

```sql
select customer_id, sum(amount) as revenue
from orders
group by customer_id
```

```python
def revenue(orders: list[Order]) -> int:
    """Sum of paid orders."""
    return sum(order.amount for order in orders if order.paid)
```

---

Owner: data team.
