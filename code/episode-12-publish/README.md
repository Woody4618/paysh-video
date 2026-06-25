# Episode 12 — Publishing to the pay-skills Catalog

Make your gateway discoverable to every pay-enabled agent. Discovery metadata
lives in a provider **markdown** file in the registry (frontmatter + usage
notes); the runtime `.yml` is what `pay server start` consumes.

`providers/solana-foundation/prod-gateway.md` is a ready-to-edit example listing
for the Episode 11 gateway. Registry paths:

```text
providers/<operator>/<name>.md            # you operate the API directly
providers/<operator>/<origin>/<name>.md    # your gateway proxies another provider
```

## Generate metadata from your runtime spec

```sh
pay skills provider sync ../episode-11-mainnet/provider.mainnet.yml \
  --operator solana-foundation \
  --service-url 'https://prod-gateway.example.com' \
  --sandbox-service-url 'https://sandbox-prod-gateway.example.com' \
  --out providers
```

Then hand-add registry-only fields (`use_case`, usage notes) the YAML didn't
carry.

## Validate before opening a PR (repo-authoritative)

```sh
# Static + structural validation; --no-probe skips the network round-trip.
pay skills build . --output /tmp/pay-skills-dist --no-probe

# Probe-driven: hit each endpoint, classify, surface the result.
pay skills probe . \
  --files providers/solana-foundation/prod-gateway.md \
  --currencies USDC,USDT --timeout 15 --concurrency 5

# CI gate. --changed-from auto-detects changed providers via git diff;
# --format github emits inline PR annotations; --strict blocks on non-Solana.
pay skills validate . \
  --files providers/solana-foundation/prod-gateway.md \
  --currencies USDC,USDT
```

## After merge — confirm discovery

```sh
pay skills update
pay skills search "usage reports"
pay skills endpoints solana-foundation/prod-gateway reports
```

## Frontmatter rules (verified against the repo reference)

- `name` matches the filename without `.md`.
- `description` is required, **64–255 chars**; says what the service is and
  returns; must NOT start with `Use for`.
- `use_case` is required, **32–255 chars**; starts with `Use for` / `Use when`.
- `category` is one of the registry categories (`ai_ml analytics cloud compute
  data devtools finance identity iot maps media messaging other productivity
  search security storage translation`).
- `service_url` must be a production HTTPS domain (not localhost / IP).
- A spec declares exactly one of `endpoints:` or `openapi:`. Use `openapi:` once
  your gateway serves `/openapi.json`.
- Omit `pricing` for free endpoints; include it only when the endpoint returns a
  valid paid 402.

## Gotchas

- Validators are `pay skills build` / `probe` / `validate` — there is **no**
  `pay skills lint`.
- Registry markdown is for **discovery**; runtime YAML is for `pay server start`.
  Keep pricing, endpoints, and currency in sync.

## Docs

- Monetize / publish reference (repo): https://github.com/solana-foundation/pay/blob/main/skills/pay/references/monetize-api.md
- Publish to pay-skills: https://pay.sh/docs/accept-payments/publish-to-pay-skills
- Discover providers: https://pay.sh/docs/pay-for-apis/discover-providers
- `pay skills` reference: https://pay.sh/docs/toolchain/commands/agents
- Catalog repo: https://github.com/solana-foundation/pay-skills
