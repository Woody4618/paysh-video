# Episode 11 — Publishing to the pay-skills Catalog

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

`providers/solana-foundation/weather-pro/PAY.md` is the listing for the
**Weather Pro** gateway we deployed in Episode 10 — a free `locations` list plus a
paid `forecast` endpoint at $0.01. Registry paths:

```text
providers/<operator>/<name>/PAY.md           # you operate the API directly
providers/<operator>/<origin>/<name>/PAY.md  # your gateway proxies another provider
```

The `name:` field must match the parent directory name. Sidecar files such as
`openapi.json` live in the same directory as `PAY.md`.

## The gateway is already deployed

`service_url` must be a **live, public HTTPS domain** — the catalog probe calls
it, so localhost won't do. We don't need to deploy anything new: **Episode 10
already put Weather Pro on Vercel** at `https://paysh-video-gateway.vercel.app`,
which serves `/health`, `/locations` (free), `/forecast` (paid $0.01), and its own
`/openapi.json`.

```sh
# Confirm it's live before listing it.
curl -fsS https://paysh-video-gateway.vercel.app/health
curl -fsS https://paysh-video-gateway.vercel.app/openapi.json | jq '.info.title'
```

Episode 10 uses the official image `ghcr.io/solana-foundation/pay:latest`, injects
RPC URL / recipient / keypair from Vercel project env vars, and signs with the
`env` signer for the demo. For production, migrate to a KMS-backed key
(`operator.signer.backend: gcp-kms`) — see the bundled
`skills/pay/references/monetize-api.md` → "Production Deployment" and the Cloud Run
deploy guide. The domain `https://paysh-video-gateway.vercel.app` is the
`service_url` in the listing.

## Quick start

```sh
# 1. Fork and clone the registry.
git clone git@github.com:<you>/pay-skills.git
cd pay-skills

# 2. Scaffold a provider entry from the gateway's LIVE OpenAPI document.
#    scaffold fetches the URL over the network, so it must be reachable — a fake
#    host fails with "error sending request", and local paths / file:// are not
#    supported. Our Episode 10 gateway is live, so this runs as-is.
#    The leaf of the FQN ("weather-pro") becomes name: and the directory.
pay catalog scaffold solana-foundation/weather-pro \
  https://paysh-video-gateway.vercel.app/openapi.json \
  --output-dir providers

# 3. Finish providers/solana-foundation/weather-pro/PAY.md:
#    - fill the TODO category (data) and use_case, set service_url to the domain
#    - scaffold writes `openapi.url`, but the registry rejects URLs, so snapshot
#      the spec and switch to `openapi.path`:
cd providers/solana-foundation/weather-pro
curl -fsSL https://paysh-video-gateway.vercel.app/openapi.json -o openapi.json
python3 -m json.tool openapi.json openapi.json   # pretty-print for reviewable diffs
cd -

# 4. Validate the provider. This is the check you run most often.
pay catalog check providers/solana-foundation/weather-pro/PAY.md

# 5. Optional: walk the whole registry without live probes.
pay catalog check . --no-probe
```

If `pay` is not installed, use `npx @solana/pay catalog ...`.

> **Note:** the committed `weather-pro` listing points at a **real, live** gateway
> (`https://paysh-video-gateway.vercel.app`), so both `pay catalog check --no-probe`
> (static) and the live `-v` probe should pass — the probe expects a Solana 402 on
> `/forecast` (USDC) and free `/health` + `/locations`. If that deployment is ever
> taken down, only the live `-v` probe fails; `--no-probe` still passes.

## Validation commands (verified against `pay 0.21.0`)

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
pay skills search "weather forecast"
pay skills show solana-foundation/weather-pro
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
