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

- Two requirements the public gate way 
https://paysh-video-gateway.vercel.app/openapi.json
And our api 
https://paysh-video.vercel.app/ 

- Show the open api spec from our API and the gateway. 

- Scafold the pay.sh catalog in the pay skills repo 
- Adjust the PAY.md to fit the needs. 
- Copy over the openapi.json from our API to the pay.sh catalog. Its created via ZOD and already creates the correct openapi spec where the titles are correct above 25 letters for example. Just health check would not pass the verification. 
- Check the pay.sh catalog check. 
- open PR 
- Review PR 
<Break> 
- Show PR probe 
- Explain what paysh does with the two files 
- Show the pay skills search and show commands



- 🖥️ Lower-third: `service_url must be a live public domain`
- ⌨️ You run:

```sh
# The gateway from Episode 10 — free endpoints answer without payment.
curl -fsS https://paysh-video-gateway.vercel.app/health
curl -fsS https://paysh-video-gateway.vercel.app/locations
```

- 🎙️ "Health and locations answer for free — the paywall only kicks in on
  `forecast`. In production the fee-payer signer is a KMS-backed key and secrets
  come from the platform's env vars, exactly as we set up in Episode 10. Now let's
  list it."

### Scene 3 — Scaffold + drop in the app's OpenAPI (0:55–1:40)

- 🎙️ "I fork and clone the registry, then let pay scaffold the entry. The leaf of
  the name — `weather-pro` — becomes the `name:` field and the directory it lands
  in. Scaffold just needs *an* OpenAPI URL to read the title and endpoint list
  from, so I point it at the live gateway. But scaffold is only bootstrapping the
  `PAY.md` skeleton — the spec I actually publish is the richer one my Next.js app
  already generates."
- 🖥️ Lower-third: `pay catalog scaffold <fqn> <openapi-url>`
- ⌨️ You run:

```sh
git clone git@github.com:<you>/pay-skills.git
cd pay-skills

# Scaffold the PAY.md skeleton. The URL just seeds title + endpoints.
pay catalog scaffold solana-foundation/weather-pro \
  https://paysh-video-gateway.vercel.app/openapi.json \
  --output-dir providers
```

- 🎙️ "Now the key move. Back in Episode 10 my Next.js app describes its own API
  with Zod schemas, and `openapi-gen` turns those into a full OpenAPI document —
  request params, response bodies, the works — far richer than the gateway's
  auto-synthesized one. I copy *that* generated spec into the listing. In the app
  repo it's a one-liner — `npm run openapi:snapshot` regenerates it and copies it
  straight into this provider folder. Here I'll just show the copy."
- ⌨️ You run:

```sh
# Copy the app's GENERATED OpenAPI spec into the listing (the rich one with
# full request/response schemas). In the Episode 10 app repo this is:
#   npm run openapi:snapshot   # regenerate + copy here + set servers[].url
cp <episode-10-app>/public/openapi.json \
   providers/solana-foundation/weather-pro/openapi.json
```

- 🎙️ "Then I finish the `PAY.md`: scaffold leaves `use_case` and `category` as
  TODO and references the spec by `openapi.url`, but the registry won't accept a
  URL — so I switch it to `openapi.path: openapi.json`, the file I just copied in.
  I fill the `category` (`data`) and a real `use_case`, and set `service_url` to
  our gateway's domain. The finished result is the `weather-pro` listing in the
  companion folder."
- 🖥️ Show the finished `PAY.md`: frontmatter (`name: weather-pro`, `title`,
  `description`, `use_case`, `category: data`, `service_url`, `openapi.path`) + the
  prose body, with the committed `openapi.json` sitting beside it.

### Scene 4 — Check it and open the PR (1:40–2:35)

- 🎙️ "The one command I run most is `pay catalog check`. It parses the frontmatter,
  resolves the OpenAPI spec, and gives a verdict — all read-only. Let me run the
  fast static pass first."
- ⌨️ You run:

```sh
# Fast frontmatter + OpenAPI smoke test (no live probe).
pay catalog check providers/solana-foundation/weather-pro/PAY.md --no-probe
```

- 🖥️ Show the clean pass: `PAY.md check successful`.
- 🎙️ "Green on the first pass — and that's not luck. Because my spec is generated
  from the app's Zod schemas, each operation's `summary` is already a real
  sentence: verb-first, the right length, no marketing words. The catalog is
  strict about summaries because that text becomes the reason line on the payer's
  Touch ID prompt — 24 to 63 characters, starts with an action verb, no `Free` or
  `$0.01`. If it *had* complained, I wouldn't patch the snapshot by hand — I'd fix
  the description back in the app's route and re-run `npm run openapi:snapshot`, so
  the published spec never drifts from the code."
- ⌨️ Now the live pass:

```sh
# Drop --no-probe: this calls the deployed gateway endpoint by endpoint.
pay catalog check providers/solana-foundation/weather-pro/PAY.md -v
```

- 🖥️ Show the probe table + verdict:

```text
Probe results
providers/solana-foundation/weather-pro FAIL
  GET forecast     OK   402 mpp   USDC
  GET health       FAIL expected 402, got 200
  GET locations    FAIL expected 402, got 200

Solana-compat verdict
PASS   providers/solana-foundation/weather-pro (1/1)
  OK   GET forecast   paid via mpp (ok)
  FREE GET health     free / not gated
  FREE GET locations  free / not gated
│ PAY.md check successful — 1/1 gates compatible with Solana
```

- 🎙️ "Don't let those red lines spook you. The probe *expects* a 402 on every
  endpoint, so it flags `health` and `locations` when they answer 200 — then it
  reclassifies them as free, because our listing marks them with no pricing. Only
  `forecast` has to return a challenge, and it does: a valid Solana 402 in USDC.
  So the verdict is `PASS`, one of one gates compatible. Notice the *price* itself
  comes from that live probe, not from my committed spec — I never hand-write
  pricing into the JSON. This is exactly what PR CI runs, so green locally means
  green in CI."
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
- 🏗️ `pay catalog scaffold <fqn> <openapi-url>` — bootstrap the `PAY.md` skeleton
- 📄 Publish the app's generated OpenAPI (`openapi-gen` → `openapi.path`), not the
  gateway's synthesized one
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
  `use_case`/`category` as `TODO`. Before publishing you must (a) put the spec next
  to `PAY.md` as `openapi.json` and switch the field to `openapi.path`, (b) fill
  the two TODO fields (`category: data`, plus the weather `use_case`), and (c) set
  `service_url` to `https://paysh-video-gateway.vercel.app`. Tiny specs can use
  inline `openapi.content` instead. The committed `weather-pro` listing is the
  finished result.
- **The committed `openapi.json` is the APP's GENERATED spec, not the gateway's.**
  The public gateway URL (`…/openapi.json`) serves the gateway's *minimal*
  auto-synthesized doc — 3 paths, no component schemas. The listing instead
  publishes the richer document the Episode 10 Next.js app generates from its Zod
  schemas via `openapi-gen` (full request params + response bodies). We copy that
  committed `public/openapi.json` into the provider dir; the app repo's
  `npm run openapi:snapshot` does exactly this (regenerate → copy here → set
  `servers[].url` to the gateway domain). Do **not** `curl` the gateway for the
  listing's spec — that would publish the thin synthesized version.
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
- **Summaries come from the app's Zod/JSDoc, so fix drift at the source.** Our
  published spec is generated by `openapi-gen` from the Next.js routes, where each
  operation's `summary` is the JSDoc title on the handler (e.g.
  `Fetch current conditions and 7-day forecast for a location`). These already
  satisfy the catalog rules. If `pay catalog check` ever flags a summary, fix the
  JSDoc/Zod in the Episode 10 route and re-run `npm run openapi:snapshot` — never
  hand-patch the committed `openapi.json`, or it drifts from the code. (This is a
  change from earlier drafts, which fixed `provider.yml` `description:` fields
  because the listing used to publish the gateway's *synthesized* spec. The listing
  now publishes the app's generated spec, so the source of truth is the route
  JSDoc, not `provider.yml`.)
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
