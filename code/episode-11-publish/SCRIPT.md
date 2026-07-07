# Episode 11 — Publishing to the pay-skills Catalog

**Duration:** 2:30 (deploy beat is illustrative — keep it tight or cut to a card)
**Companion doc:** <https://pay.sh/docs/accept-payments/publish-to-pay-skills>
**Deploy reference:** bundled `skills/pay/references/monetize-api.md` → "Production Deployment"
**CLI reference:** <https://pay.sh/docs/toolchain/commands/agents>
**Code:** `code/episode-11-publish/`

> **Where you run this:** the `pay catalog` commands run from the root of a local
> clone of the **catalog** registry
> [`solana-foundation/pay-skills`](https://github.com/solana-foundation/pay-skills)
> (that's what the `.` / `providers/…` paths point at) — **not** the `pay` binary
> repo. Each provider lives at `providers/<operator>/<name>/PAY.md`;
> `code/episode-11-publish/` mirrors that layout so you can rehearse before cloning.

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "A gateway that nobody can find is a gateway that nobody pays. The pay-skills
  catalog is the open registry that both agents and humans search to discover paid
  APIs — and getting yours listed is just a fork, a `PAY.md`, and a pull request."

### Scene 2 — Deploy the gateway so it has a real URL (0:20–0:55)

- 🎙️ "One thing first: the catalog only lists gateways that are actually reachable
  on a public HTTPS domain — `service_url` can't be localhost. So the gateway we
  built in the earlier episodes has to live somewhere. Pay ships as a container,
  so the simplest path is one Cloud Run service per gateway: run
  `pay server start` against your spec, bind to the platform port, and put a domain
  in front. That domain is what goes in the listing."
- 🖥️ Lower-third: `ghcr.io/solana-foundation/pay` on Cloud Run
- ⌨️ You run (illustrative — this is your deploy, done once):

```sh
# Inside the container image, one service per provider spec:
pay server start /app/providers/prod-gateway.yml \
  --bind 0.0.0.0:8080 \
  --openapi /app/providers/prod-gateway.openapi.json
```

- 🎙️ "Secrets — upstream API keys, RPC URLs, the fee-payer signer — come from your
  cloud secret manager, and for production you sign with a KMS-backed key, not a
  file. Once it's live at, say, `https://prod-gateway.example.com`, we can list it."

### Scene 3 — Scaffold + finish the entry (0:55–1:35)

- 🎙️ "I fork and clone the registry, then let pay scaffold a provider entry
  straight from a gateway's live OpenAPI document. The leaf of the name —
  `prod-gateway` — becomes the `name:` field and the directory it lands in.
  Scaffold fetches the spec over the network, so the URL has to actually be live —
  point it at your deployed gateway. On camera I'll point it at an already-live
  gateway so the fetch succeeds."
- 🖥️ Lower-third: `pay catalog scaffold <fqn> <openapi-url>`
- ⌨️ You run:

```sh
git clone git@github.com:<you>/pay-skills.git
cd pay-skills

# Swap the URL for your own deployed gateway's /openapi.json. It must be live —
# scaffold fetches it and errors on an unreachable host.
pay catalog scaffold solana-foundation/prod-gateway \
  https://texttospeech.google.gateway-402.com/openapi.json \
  --output-dir providers
```

- 🎙️ "Scaffold pre-fills the title and description from the live spec, but three
  things still need me. It references the spec by `openapi.url`, and the registry
  won't accept a URL — so I snapshot the spec next to the file and switch the field
  to `openapi.path`. I fill in the `category` and the `use_case` it left as TODO.
  And I set `service_url` to my gateway's real domain. The finished result is the
  small `prod-gateway` listing in the companion folder."
- ⌨️ You run:

```sh
cd providers/solana-foundation/prod-gateway
curl -fsSL https://<your-gateway>/openapi.json -o openapi.json
python3 -m json.tool openapi.json openapi.json   # pretty-print for reviewable diffs
# then in PAY.md: set category + use_case + service_url, and replace
#   openapi:\n  url: …   with   openapi:\n  path: openapi.json
```

- 🖥️ Show the finished `PAY.md`: frontmatter (`name`, `title`, `description`,
  `use_case`, `category`, `service_url`, `openapi.path`) + the prose body, with
  the committed `openapi.json` sitting beside it.

### Scene 4 — Check it + open the PR (1:35–2:20)

- 🎙️ "The one command I run most is `pay catalog check` on my provider file. It
  parses the frontmatter, resolves the OpenAPI spec, probes the live endpoints,
  and gives a Solana verdict — all read-only, it never writes to disk."
- ⌨️ You run:

```sh
# Fast frontmatter + OpenAPI smoke test (no live probe).
pay catalog check providers/solana-foundation/prod-gateway/PAY.md --no-probe

# Full check: probe each endpoint and print the per-endpoint verdict table.
pay catalog check providers/solana-foundation/prod-gateway/PAY.md -v
```

- 🎙️ "`--no-probe` is the quick static pass. Drop it and add `-v` for the real
  thing: it calls the deployed gateway and shows you, endpoint by endpoint, whether
  each one returns a valid Solana 402 in USDC or USDT. That same command is what PR
  CI runs — with `--changed-from origin/main` to scope it to what you touched, and
  `--format github` to leave inline annotations on the pull request. If it's green
  locally, it's green in CI."
- 🖥️ Open the PR on solana-foundation/pay-skills. After merge:

```sh
pay skills update
pay skills search "usage reports"
pay skills show solana-foundation/prod-gateway
```

- 🎙️ "Within a few minutes of the merge, `pay skills search` and `pay skills show`
  surface the provider — and so do the Pay MCP catalog tools every agent uses."

### Scene 5 — Takeaway (2:20–2:30)

- 🎙️ "So with one merged pull request, your gateway becomes discoverable to every
  pay-enabled agent on the network. My advice is to treat that catalog entry like
  it's your API documentation — stale or wrong metadata will cost you agent
  traffic even faster than actual downtime would."

### Description bullets

- 📂 solana-foundation/pay-skills — the open registry (`providers/<fqn>/PAY.md`)
- 🏗️ `pay catalog scaffold <fqn> <openapi-url>` — generate the entry from OpenAPI
- ✅ `pay catalog check providers/<fqn>/PAY.md` — the check you run most
- 🔎 `pay skills search` / `pay skills show` confirm discovery after merge

### Accuracy notes

- **Real commands (verified against `pay 0.20.0` + the updated publish doc):** the
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
  `name:` must match the parent directory name.
- **Frontmatter:** required `name`, `title`, `description`, `use_case`, `category`,
  `service_url`, plus exactly one of `openapi:` or inline `endpoints:`.
  `description` 64–255 chars (capabilities + result shapes); `use_case` 32–255
  chars naming concrete agent tasks; `service_url` a production HTTPS domain.
  Free endpoints omit `pricing`; paid endpoints must return a valid Solana 402 in
  USDC/USDT.
- **Scaffold fetches the URL over the network (verified live 2026-06-30):**
  `pay catalog scaffold <fqn> <url>` only accepts a reachable HTTPS URL — a fake
  host (`prod-gateway.example.com`) fails immediately with `fetch …: error sending
  request`, and a local path / `file://` fails with `builder error`. So the
  on-camera scaffold points at an **already-live** gateway
  (`https://texttospeech.google.gateway-402.com/openapi.json`); off camera you'd
  use your own deployed gateway's URL.
- **Scaffold emits `openapi.url` + TODOs, and the registry rejects URLs:** the
  generated `PAY.md` has `openapi:\n  url: <gateway>/openapi.json` and leaves
  `use_case`/`category` as `TODO`. Before publishing you must (a) snapshot the
  spec into the provider dir (`curl -fsSL <url> -o openapi.json`, pretty-printed)
  and switch the field to `openapi.path`, (b) fill the two TODO fields, and (c)
  set `service_url` to your gateway's real domain. Tiny specs can use inline
  `openapi.content` instead. The committed `prod-gateway` listing is the finished
  result.
- **`service_url` must be a live public domain, so the gateway has to be deployed
  first.** The catalog probe in `pay catalog check` hits `service_url`; localhost
  won't do. Scene 2 makes this explicit: deploy the Episode 5/8 gateway as a
  container (`ghcr.io/solana-foundation/pay:<version>`), one `pay server start`
  per provider, `--bind 0.0.0.0:8080`, secrets from the cloud secret manager, and
  a KMS-backed signer (`operator.signer.backend: gcp-kms`) in production. The
  resulting domain (e.g. `https://prod-gateway.example.com`) is the `service_url`.
  Source: bundled `skills/pay/references/monetize-api.md` → "Production Deployment".
- **`prod-gateway.example.com` is a placeholder.** The committed example at
  `code/episode-11-publish/providers/solana-foundation/prod-gateway/` passes
  `pay catalog check --no-probe` (static), but a live `-v` probe would fail until
  you point `service_url` at a real deployment. On camera, either deploy first and
  swap in your real domain, or show `--no-probe` and call the live probe out loud.
- **Operation `summary` length:** each OpenAPI operation `summary` must be **24–63
  chars** and start with an action verb (`Fetch`, `Search`, `Create`, `Generate`…).
  It becomes the `reason:` line on the user's biometric payment prompt; the OS
  truncates at 64 chars. `pay catalog check` errors on out-of-range length and
  warns on a non-verb opener. The committed `prod-gateway` `openapi.json` keeps
  both summaries verb-first and ≤63 chars so the static check is clean.
- **`pay catalog check` flags (verified):** `--no-probe`, `-v`, `--strict`
  (non-Solana = blocking), `--currencies USDC,USDT` (default), `--changed-from
<REF>` (local devex), `--files <PATH>…` (CI), `--format table|json|github`,
  `--summary-out <PATH>`, `--probe-timeout`, `--probe-concurrency`.
- **`--changed-from` vs `--files`:** `--changed-from origin/main` is the local
  shortcut (needs `git`); CI passes an explicit `--files` list instead. They are
  mutually exclusive.
