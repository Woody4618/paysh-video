# Episode 6 — Pricing Endpoints

`pricing.yml` shows the four pricing shapes in one runnable spec:

1. `v1/search` — flat per-request (`unit: requests`, `scale: 1`).
2. `v1/generate` — LLM-style input/output token pricing (`scale: 1_000_000`).
3. `v1/enrich` — volume tiers via `up_to`.
4. `v1/infer` — `variants:` keyed on the `model` request field.

```sh
pay --sandbox server start pricing.yml

# Each call advertises its price in the 402 challenge.
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/search -d '{"q":"test"}'
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/infer  -d '{"model":"pro"}'
```

## Gotchas (verified against docs)

- Metering lives under `metering.dimensions[]`, **not** a flat `unit:` key.
- Supported stablecoins use 6 decimals. If `price_usd / scale` drops below
  0.000001 USDC, validation fails — bump `price_usd` or lower `scale`.
- `accounting: per_agent` advances volume tiers per caller; `pooled` (default)
  shares one counter across everyone.

## Docs

- Defining pricing: https://pay.sh/docs/building-with-pay/pricing
- Usage-metered reference: https://pay.sh/docs/accept-payments/usage-metered
