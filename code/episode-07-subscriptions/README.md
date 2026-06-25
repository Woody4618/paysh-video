# Episode 7 — Recurring Subscriptions

`subscription.yml` declares one subscription endpoint: $9.99 USDC / 30 days.

```sh
# Terminal A — first launch prompts to publish the on-chain Plan PDA.
# Answer `y`; sandbox covers the rent. The plan_id is written back into the YAML.
pay --sandbox server start subscription.yml

# Terminal B — first call activates the subscription ($9.99 charge, Touch ID).
pay --sandbox curl http://127.0.0.1:1402/api/v1/pro/feed
# Second call within the period — no prompt, just the response.
pay --sandbox curl http://127.0.0.1:1402/api/v1/pro/feed
```

Inspect / cancel from the subscriber side:

```sh
pay subscriptions list                 # schedule, recipient, amount, status, id
pay subscriptions status <subscription_id>
pay subscriptions cancel <subscription_id>
```

## Gotchas (verified against docs)

- `period: month` / `1m` / `1y` are **rejected**. Use `30d`, `2w`, etc. The
  mapped interval must fall in `[1h, 8760h]` (max one year).
- `subscription:` and `metering:` are mutually exclusive on one endpoint. To
  offer both, expose two endpoints.
- After the Plan PDA is published, **commit the updated YAML** — `plan_id` is
  part of your provider contract.
- For CI / non-interactive publishing: `pay server plans publish --spec subscription.yml --write`.

## Docs

- Concept: https://pay.sh/docs/building-with-pay/subscriptions/concept
- YAML spec: https://pay.sh/docs/building-with-pay/subscriptions/yaml-specification
- Manage subscriptions (subscriber side): https://pay.sh/docs/using-pay/subscriptions
