# Episode 10 — Publishing to the pay-skills Catalog

Make your gateway discoverable to every pay-enabled agent. Discovery metadata
lives in a provider **`PAY.md`** file in the registry (frontmatter + prose notes,
plus a committed OpenAPI snapshot); the runtime `.yml` is what `pay server start`
consumes.

> **Where you run the `pay catalog` commands below:** from the root of a local
> clone of the catalog registry
> [`solana-foundation/pay-skills`](https://github.com/solana-foundation/pay-skills)
> — that is what the `.` / `providers/…` paths refer to, **not** the `pay` binary
> repo. This folder mirrors the registry's `providers/<operator>/<name>/` layout
> so you can rehearse the flow before cloning.

`providers/solana-foundation/prod-gateway/PAY.md` is a small, self-contained
example listing (a `v1/reports/usage` endpoint at $0.01). Registry paths:

```text
providers/<operator>/<name>/PAY.md           # you operate the API directly
providers/<operator>/<origin>/<name>/PAY.md  # your gateway proxies another provider
```

The `name:` field must match the parent directory name. Sidecar files such as
`openapi.json` live in the same directory as `PAY.md`.

## Deploy the gateway first

`service_url` must be a **live, public HTTPS domain** — the catalog probe calls
it, so localhost won't do. Deploy the gateway you built in the earlier episodes
as a container before listing it:

```sh
# One Cloud Run service per provider spec, bound to the platform port.
pay server start /app/providers/prod-gateway.yml \
  --bind 0.0.0.0:8080 \
  --openapi /app/providers/prod-gateway.openapi.json
```

Use the official image `ghcr.io/solana-foundation/pay:<version>` (pin the tag),
inject upstream API keys / RPC URLs / recipient config from your cloud secret
manager, and sign with a KMS-backed key (`operator.signer.backend: gcp-kms`) in
production. The resulting domain (e.g. `https://prod-gateway.example.com`) is the
`service_url` you put in the listing. See the bundled
`skills/pay/references/monetize-api.md` → "Production Deployment".

## Quick start

```sh
# 1. Fork and clone the registry.
git clone git@github.com:<you>/pay-skills.git
cd pay-skills

# 2. Scaffold a provider entry from a gateway's LIVE OpenAPI document.
#    scaffold fetches the URL over the network, so it must be reachable — a fake
#    host fails with "error sending request", and local paths / file:// are not
#    supported. Point it at your deployed gateway; the example below uses an
#    already-live gateway so the command runs as-is.
#    The leaf of the FQN ("prod-gateway") becomes name: and the directory.
pay catalog scaffold solana-foundation/prod-gateway \
  https://texttospeech.google.gateway-402.com/openapi.json \
  --output-dir providers

# 3. Finish providers/solana-foundation/prod-gateway/PAY.md:
#    - fill the TODO category and use_case, and set service_url to your domain
#    - scaffold writes `openapi.url`, but the registry rejects URLs, so snapshot
#      the spec and switch to `openapi.path`:
cd providers/solana-foundation/prod-gateway
curl -fsSL https://<your-gateway>/openapi.json -o openapi.json
python3 -m json.tool openapi.json openapi.json   # pretty-print for reviewable diffs
cd -

# 4. Validate the provider. This is the check you run most often.
pay catalog check providers/solana-foundation/prod-gateway/PAY.md

# 5. Optional: walk the whole registry without live probes.
pay catalog check . --no-probe
```

If `pay` is not installed, use `npx @solana/pay catalog ...`.

> **Note:** `prod-gateway.example.com` is a placeholder. It means two things:
> (1) `pay catalog scaffold` can't fetch from it — scaffold needs a **live** URL,
> so the Quick Start above points at an already-live gateway and you swap in your
> own deployed domain; and (2) the committed example passes `pay catalog check
> --no-probe` (static) but a live `-v` probe will fail until `service_url` points
> at a real deployment.

## Validation commands (verified against `pay 0.20.0`)

| Command | Use |
| --- | --- |
| `pay catalog check providers/<fqn>/PAY.md` | Validate one provider: frontmatter + OpenAPI resolution + live probe + Solana verdict. |
| `pay catalog check providers/<fqn>/PAY.md --no-probe` | Faster frontmatter + OpenAPI smoke test, no network. |
| `pay catalog check providers/<fqn>/PAY.md -v` | Per-endpoint probe + verdict tables. |
| `pay catalog check providers/<fqn>/PAY.md --strict` | Treat every non-Solana endpoint as a blocking error. |
| `pay catalog check . --changed-from origin/main` | Probe providers changed since `origin/main` (local PR prep; needs `git`). |
| `pay catalog check . --files providers/<fqn>/PAY.md --format github` | What PR CI runs: explicit file list + inline annotations. |
| `pay catalog build .` | Main-branch CI only: writes `dist/skills.json`. Provider PRs usually skip it. |

`check` is read-only and never writes to disk. `--currencies` defaults to
`USDC,USDT`; an endpoint advertising another currency is flagged
`wrong_currency`. `--changed-from` and `--files` are mutually exclusive.

## After merge — confirm discovery

```sh
pay skills update
pay skills search "usage reports"
pay skills show solana-foundation/prod-gateway
```

## Frontmatter rules

- `name` matches the parent directory name.
- `title` — human-readable provider name.
- `description` — required, **64–255 chars**; capabilities + result shapes.
- `use_case` — required, **32–255 chars**; names concrete agent tasks.
- `category` — one registry category (`ai_ml analytics cloud compute data
  devtools finance identity iot maps media messaging other productivity search
  security storage translation`).
- `service_url` — production HTTPS domain (not localhost / IP).
- Exactly one of `openapi:` or inline `endpoints:`. Prefer `openapi.path` (a
  committed snapshot) or tiny inline `openapi.content`. The registry **rejects
  `openapi.url`** — fetch the spec once and commit it.
- Omit `pricing` for free endpoints; paid endpoints must return a valid Solana
  402 challenge accepting USDC or USDT.

## PR checklist

- `pay catalog check providers/<fqn>/PAY.md` is green locally.
- OpenAPI committed via `openapi.path` (or inline `openapi.content`), never a URL.
- `name:` matches the parent directory name.
- No `TODO` placeholders remain.
- Free endpoints omit `pricing`; paid endpoints return a Solana 402 in USDC/USDT.

## Gotchas

- The publish flow is `pay catalog scaffold` / `pay catalog check` / `pay catalog
  build` — there is **no** `pay skills lint`, and **no** `pay skills build` /
  `probe` / `validate` / `provider sync` (earlier drafts referenced those; they
  never shipped in the binary).
- Registry `PAY.md` is for **discovery**; runtime YAML is for `pay server start`.
  Keep pricing, endpoints, and currency in sync.

## Docs

- Publish to pay-skills: https://pay.sh/docs/accept-payments/publish-to-pay-skills
- Discover providers: https://pay.sh/docs/pay-for-apis/discover-providers
- `pay skills` reference: https://pay.sh/docs/toolchain/commands/agents
- Catalog repo: https://github.com/solana-foundation/pay-skills
