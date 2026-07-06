# Episode 6 — Pricing Endpoints

`pricing.yml` shows the four pricing shapes in one runnable spec:

1. `v1/search` — flat per-request (`unit: requests`, `scale: 1`).
2. `v1/generate` — LLM-style input/output token pricing (`scale: 1_000_000`).
3. `v1/enrich` — volume tiers via `up_to`.
4. `v1/models/{model}:infer` — `variants:` selected by the `model` path segment.

```sh
pay --sandbox server start pricing.yml

# Each call advertises its price in the 402 challenge.
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/search -d '{"q":"test"}'
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/models/pro:infer   # $0.10
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/models/fast:infer  # $0.01
```

## Gotchas (verified against docs)

- Metering lives under `metering.dimensions[]`, **not** a flat `unit:` key.
- `variants:` are selected **from the URL path only** — the gateway reads the
  segment right after a literal `models/` or `voices/` (e.g. `models/pro`). The
  request body is never consulted, so a body field like `{"model":"pro"}` is
  ignored and the call silently falls back to the first variant. The endpoint
  `path` must therefore be shaped like `v1/models/{model}:infer`.
- Supported stablecoins use 6 decimals. If `price_usd / scale` drops below
  0.000001 USDC, validation fails — bump `price_usd` or lower `scale`.
- `accounting: per_agent` advances volume tiers per caller; `pooled` (default)
  shares one counter across everyone.

## Docs

- Defining pricing: https://pay.sh/docs/building-with-pay/pricing
- Usage-metered reference: https://pay.sh/docs/accept-payments/usage-metered
