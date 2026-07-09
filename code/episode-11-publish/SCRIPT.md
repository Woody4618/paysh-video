# Episode 11 — Publishing to the pay-skills Catalog

**Duration:** 2:45
**Companion doc:** <https://pay.sh/docs/accept-payments/publish-to-pay-skills>
**Deploy reference:** bundled `skills/pay/references/monetize-api.md` → "Production Deployment"
**CLI reference:** <https://pay.sh/docs/toolchain/commands/agents>
**Code:** `code/episode-11-publish/`
**Gateway from Episode 10:** <https://paysh-video-gateway.vercel.app>

> **Where you run this:** the `pay catalog` commands run from the root of a local
> clone of the **catalog** registry
> [`solana-foundation/pay-skills`](https://github.com/solana-foundation/pay-skills)
> (that's what the `.` / `providers/…` paths point at) — **not** the `pay` binary
> repo. Each provider lives at `providers/<operator>/<name>/PAY.md`;
> `code/episode-11-publish/` mirrors that layout so you can rehearse before cloning.
>
> **We're publishing the Weather Pro gateway from Episode 10.** It's already
> deployed on Vercel at `https://paysh-video-gateway.vercel.app`, with a free
> `/locations` list and a paid `/forecast` endpoint. This episode just makes it
> discoverable.

### Scene 1 — Cold open (0:00–0:20)

In the last episode we deployed our Weather Pro gateway to the public
internet. But a gateway that nobody can find is a gateway that nobody pays. The
pay-skills catalog is the open registry that both agents and humans search to
discover paid APIs — and getting ours listed is just a fork, a `PAY.md`, and a
pull request away. Lets publish the weather PRO api together! 

### Scene 2 — The gateway is already live (0:20–0:55)

- 🎙️ "One requirement first: the catalog only lists gateways reachable on a public
  HTTPS domain — `service_url` can't be localhost. Ours is already there: Episode
  10 put Weather Pro on Vercel at `paysh-video-gateway.vercel.app`. Let me prove
  it's live and serving an OpenAPI doc before I list it."
- 🖥️ Lower-third: `service_url must be a live public domain`
- ⌨️ You run:

```sh
# The gateway from Episode 10 — free endpoints answer without payment.
curl -fsS https://paysh-video-gateway.vercel.app/health
curl -fsS https://paysh-video-gateway.vercel.app/locations

# It also serves an OpenAPI doc the catalog can read.
curl -fsS https://paysh-video-gateway.vercel.app/openapi.json | jq '.info.title'
```

- 🎙️ "Health and locations answer for free, and the gateway serves its own
  `/openapi.json` — that's the document the catalog scaffolder reads. In
  production the fee-payer signer is a KMS-backed key and secrets come from the
  platform's env vars, exactly as we set up in Episode 10. Now let's list it."

### Scene 3 — Scaffold + finish the entry (0:55–1:35)

- 🎙️ "I fork and clone the registry, then let pay scaffold a provider entry
  straight from our gateway's live OpenAPI document. The leaf of the name —
  `weather-pro` — becomes the `name:` field and the directory it lands in.
  Scaffold fetches the spec over the network, so the URL has to be live — and ours
  is, from Episode 10."
- 🖥️ Lower-third: `pay catalog scaffold <fqn> <openapi-url>`
- ⌨️ You run:

```sh
git clone git@github.com:<you>/pay-skills.git
cd pay-skills

# Point scaffold at OUR deployed gateway's /openapi.json (from Episode 10).
pay catalog scaffold solana-foundation/weather-pro \
  https://paysh-video-gateway.vercel.app/openapi.json \
  --output-dir providers
```

- 🎙️ "Scaffold pre-fills the title and description from the live spec, but three
  things still need me. It references the spec by `openapi.url`, and the registry
  won't accept a URL — so I snapshot the spec next to the file and switch the field
  to `openapi.path`. I fill in the `category` and the `use_case` it left as TODO.
  And I set `service_url` to our gateway's real domain. The finished result is the
  `weather-pro` listing in the companion folder."
- ⌨️ You run:

```sh
cd providers/solana-foundation/weather-pro
curl -fsSL https://paysh-video-gateway.vercel.app/openapi.json -o openapi.json
python3 -m json.tool openapi.json openapi.json   # pretty-print for reviewable diffs
# then in PAY.md: set category (data) + use_case + service_url
#   (https://paysh-video-gateway.vercel.app), and replace
#   openapi:\n  url: …   with   openapi:\n  path: openapi.json
```

- 🖥️ Show the finished `PAY.md`: frontmatter (`name: weather-pro`, `title`,
  `description`, `use_case`, `category: data`, `service_url`, `openapi.path`) + the
  prose body, with the committed `openapi.json` sitting beside it.

### Scene 4 — Check it, fix the real spec, re-check (1:35–2:35)

- 🎙️ "The one command I run most is `pay catalog check`. It parses the frontmatter,
  resolves the OpenAPI spec, and gives a verdict — all read-only. Let me run the
  fast static pass first."
- ⌨️ You run:

```sh
# Fast frontmatter + OpenAPI smoke test (no live probe).
pay catalog check providers/solana-foundation/weather-pro/PAY.md --no-probe
```

- 🖥️ Show the REAL warnings/errors it prints on the scaffolded spec:

```text
│ - GET /health: operation summary too short (19 chars, min 24)
│     got: "Health check. Free."
│ - GET /locations: operation summary contains marketing language `free`
│ - GET /forecast: operation summary should start with an action verb
│     got: "Current + 7-day forecast for a location. $0.01 per request."
```

- 🎙️ "And it fails — three of them. Now, here's the important part: I did **not**
  hand-write this OpenAPI. The gateway synthesized it from my `provider.yml`, and
  each operation's `summary` is literally the endpoint's `description`. So the
  catalog is really complaining about my *server spec*: the summaries are too
  short, start with a noun, and shout `Free` and `$0.01` — which the catalog bans,
  because that text becomes the reason line on the payer's Touch ID prompt."
- 🎙️ "So I don't patch the snapshot — that would just drift from what the gateway
  serves. I fix the source, back in Episode 10's `provider.yml`."
- ⌨️ Edit `provider.yml` descriptions to be verb-first, 24–63 chars, no cost words:

```yaml
endpoints:
  - { method: GET, path: 'health',    description: 'Check gateway health and readiness status' }
  - { method: GET, path: 'locations', description: 'List supported forecast locations by name' }
  - { method: GET, path: 'forecast',  description: 'Fetch current and 7-day forecast for a city', ... }
```

- ⌨️ Redeploy the gateway, then re-snapshot and re-check:

```sh
# 1. push provider.yml + redeploy the gateway (Vercel picks up the new spec)
git commit -am "catalog-friendly endpoint summaries" && git push

# 2. re-pull the now-clean synthesized spec into the listing
cd providers/solana-foundation/weather-pro
curl -fsSL https://paysh-video-gateway.vercel.app/openapi.json -o openapi.json
python3 -m json.tool openapi.json openapi.json

# 3. re-run the check — now green
pay catalog check providers/solana-foundation/weather-pro/PAY.md --no-probe
pay catalog check providers/solana-foundation/weather-pro/PAY.md -v
```

- 🎙️ "Redeploy, re-pull the spec, re-check — green. Drop `--no-probe` and add `-v`
  for the live pass: it calls the deployed gateway and shows, endpoint by endpoint,
  whether each returns a valid Solana 402 in USDC or USDT — `forecast` returns the
  challenge, `health` and `locations` are free. That same command is what PR CI
  runs, so if it's green locally, it's green in CI."
- 🖥️ Open the PR on solana-foundation/pay-skills. After merge:

```sh
pay skills update
pay skills search "weather forecast"
pay skills show solana-foundation/weather-pro
```

- 🎙️ "Within a few minutes of the merge, `pay skills search` and `pay skills show`
  surface the provider — and so do the Pay MCP catalog tools every agent uses."

### Scene 5 — Takeaway (2:35–2:45)

- 🎙️ "So with one merged pull request, your gateway becomes discoverable to every
  pay-enabled agent on the network. My advice is to treat that catalog entry like
  it's your API documentation — stale or wrong metadata will cost you agent
  traffic even faster than actual downtime would."

### Description bullets

- 📂 solana-foundation/pay-skills — the open registry (`providers/<fqn>/PAY.md`)
- 🌦️ Publishing the Episode 10 Weather Pro gateway (`paysh-video-gateway.vercel.app`)
- 🏗️ `pay catalog scaffold <fqn> <openapi-url>` — generate the entry from OpenAPI
- ✅ `pay catalog check providers/<fqn>/PAY.md` — the check you run most
- 🔎 `pay skills search` / `pay skills show` confirm discovery after merge

### Accuracy notes

- **Real commands (verified against `pay 0.21.0` + the updated publish doc):** the
  publish flow is `pay catalog scaffold` → edit `PAY.md` → `pay catalog check`.
  `pay catalog build .` writes `dist/skills.json` and is for **main-branch CI** on
  a green tree — a local provider PR usually does not run it. There is **no**
  `pay skills build` / `probe` / `validate` and **no** `pay skills provider sync`
  (earlier drafts of this script used those; they never existed in the binary).
- **Run from the catalog clone:** `pay catalog check`/`build` take `.` or
  `providers/<fqn>/PAY.md` relative to your clone of `solana-foundation/pay-skills`,
  not the `pay` binary repo.
- **Registry file is `PAY.md` (uppercase)** at
  `providers/<operator>/<name>/PAY.md` (two-level when you operate the API,
  `providers/<operator>/<origin>/<name>/PAY.md` when you proxy another provider).
  We use the two-level layout — `providers/solana-foundation/weather-pro/PAY.md` —
  because we operate the Weather Pro API ourselves. `name:` must match the parent
  directory name (`weather-pro`).
- **Frontmatter:** required `name`, `title`, `description`, `use_case`, `category`,
  `service_url`, plus exactly one of `openapi:` or inline `endpoints:`.
  `description` 64–255 chars (capabilities + result shapes); `use_case` 32–255
  chars naming concrete agent tasks; `service_url` a production HTTPS domain.
  Free endpoints omit `pricing`; paid endpoints must return a valid Solana 402 in
  USDC/USDT.
- **Scaffold fetches the URL over the network:**
  `pay catalog scaffold <fqn> <url>` only accepts a reachable HTTPS URL — a fake
  host fails immediately with `fetch …: error sending request`, and a local path /
  `file://` fails with `builder error`. Our Episode 10 gateway is live, so we point
  scaffold at `https://paysh-video-gateway.vercel.app/openapi.json` and the fetch
  succeeds on camera.
- **Scaffold emits `openapi.url` + TODOs, and the registry rejects URLs:** the
  generated `PAY.md` has `openapi:\n  url: <gateway>/openapi.json` and leaves
  `use_case`/`category` as `TODO`. Before publishing you must (a) snapshot the
  spec into the provider dir (`curl -fsSL <url> -o openapi.json`, pretty-printed)
  and switch the field to `openapi.path`, (b) fill the two TODO fields
  (`category: data`, plus the weather `use_case`), and (c) set `service_url` to
  `https://paysh-video-gateway.vercel.app`. Tiny specs can use inline
  `openapi.content` instead. The committed `weather-pro` listing is the finished
  result.
- **`service_url` must be a live public domain — ours already is.** The catalog
  probe in `pay catalog check` hits `service_url`; localhost won't do. Episode 10
  deployed Weather Pro as a container (`ghcr.io/solana-foundation/pay:latest`) on
  Vercel, `--bind` defaulting to `$PORT`, secrets from Vercel project env vars, and
  the `env` signer for the demo (migrate to `operator.signer.backend: gcp-kms` for
  production — see the Cloud Run + KMS deploy reference). The resulting domain
  `https://paysh-video-gateway.vercel.app` is the `service_url`.
  Source: bundled `skills/pay/references/monetize-api.md` → "Production Deployment".
- **The committed `weather-pro` example points at a real, live gateway.** So both
  `pay catalog check --no-probe` (static) and the live `-v` probe should pass — the
  probe hits `paysh-video-gateway.vercel.app` and expects a Solana 402 on
  `/forecast` (USDC), with `/health` and `/locations` free. If the deployment is
  ever taken down, the `-v` probe will fail; the static `--no-probe` check still
  passes.
- **Operation `summary` length:** each OpenAPI operation `summary` must be **24–63
  chars** and start with an action verb (`Fetch`, `Search`, `Create`, `Generate`…),
  with no cost/marketing words. It becomes the `reason:` line on the user's
  biometric payment prompt; the OS truncates at 64 chars. `pay catalog check`
  errors on out-of-range length / marketing language and warns on a non-verb
  opener.
- **The synthesized summary IS the `provider.yml` `description`.** When the gateway
  has no `--openapi` doc (our "normal flow"), it synthesizes `/openapi.json` from
  the spec and sets each operation's `summary` to that endpoint's `description:`
  verbatim (`core/src/server/openapi.rs`: `op.insert("summary", desc)`). So a
  catalog summary failure is really a **server-spec** failure — fix the
  `description:` fields in `provider.yml` and redeploy, don't hand-patch the
  snapshot (patching drifts from what the gateway actually serves). Episode 10's
  `provider.yml` now uses catalog-clean descriptions: "Check gateway health and
  readiness status", "List supported forecast locations by name", "Fetch current
  and 7-day forecast for a city" (all verb-first, 24–63 chars, no "free"/"$0.01").
- **Use `openapi.path` (authoritative).** The published publish-to-pay-skills doc
  is explicit and consistent in three places: "reference them with `openapi.path`.
  Do not publish `openapi.url`", "the public registry rejects `openapi.url`", and
  the PR checklist "committed as `openapi.path`… not referenced by URL". Our
  committed `weather-pro/PAY.md` uses `openapi.path` — correct. (Repo drift to
  report, not a blocker: `types/src/registry.rs` comments and `monetize-api.md`
  currently state the reverse — that the registry wants `url` and rejects `path`.
  The published doc wins; flag the stale in-repo docs to the pay devs.)
- **`pay catalog check` flags (verified):** `--no-probe`, `-v`, `--strict`
  (non-Solana = blocking), `--currencies USDC,USDT` (default), `--changed-from
<REF>` (local devex), `--files <PATH>…` (CI), `--format table|json|github`,
  `--summary-out <PATH>`, `--probe-timeout`, `--probe-concurrency`.
- **`--changed-from` vs `--files`:** `--changed-from origin/main` is the local
  shortcut (needs `git`); CI passes an explicit `--files` list instead. They are
  mutually exclusive.
