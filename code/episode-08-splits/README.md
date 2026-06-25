# Episode 8 — Splitting Payments

`splits.yml` shows percentage and fixed-amount splits routed to named
recipients. Recipients are declared once in the top-level `recipients:` map and
referenced from `metering.splits[]`.

```sh
# Recipients resolve from env at spec load. A missing one fails fast.
export PARTNER_WALLET=<base58>
export TAX_WALLET=<base58>

pay --sandbox server start splits.yml
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/report  -d '{}'
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/invoice -d '{}'
```

For a richer, ready-made example, open the demo spec instead:

```sh
pay --sandbox server demo   # writes pay-demo.yaml with splits already wired
```

## Gotchas (verified against docs)

- Use **exactly one** of `amount` or `percent` per split entry.
- Keep total splits **below** the per-unit price — the primary recipient must
  still receive a positive amount.
- Splits settle **inside the same on-chain transaction** as the charge: all
  recipients are paid atomically, or the call fails.
- A split referencing an unset `${ENV_VAR}` fails at spec load, not at request
  time.

## Docs

- Payment splits: https://pay.sh/docs/accept-payments/payment-splits
