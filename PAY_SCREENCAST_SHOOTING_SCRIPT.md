# pay.sh 101 Series — Shooting Script

Recording-ready version of the playlist plan. Each episode is broken into
**scenes**. Every scene gives you three things:

- **🎙️ Narration** — read this aloud, roughly verbatim (~140 wpm).
- **🖥️ On screen** — what the viewer sees (terminal command, browser, lower-third).
- **⌨️ You run** — the exact command(s) to type on camera.

All commands are verified against two authoritative sources: the live docs at
<https://pay.sh/docs> and — where they disagree, the repo wins — the docs that
ship with the binary in
[`solana-foundation/pay`](https://github.com/solana-foundation/pay) under
`skills/pay/` (`SKILL.md`, `references/monetize-api.md`, etc.) plus the Rust
provider-spec fixtures. (The legacy `typescript/solana-pay/` material in that
repo is a _different, older_ product and is intentionally ignored.) Companion
code for the producer-track episodes lives in `code/episode-NN-*/`.

> **Doc-link correction:** the planning doc linked to `docs.pay.sh/...`. The real
> docs are served from **`pay.sh/docs/...`** and the taxonomy differs. Every link
> below points at a verified live page.

---

## Global recording notes

- **Terminal:** Ghostty/Alacritty, ~16pt Diatype Semi-Mono, background `#080b0f`,
  violet accent on `pay`. Nothing else in frame.
- **Two-terminal episodes (5–9):** label them on screen as **A (gateway)** and
  **B (caller)**. Keep A on the left.
- **Debugger:** the UI is always at `http://127.0.0.1:1402/`. Under `--sandbox`
  the debugger is **on automatically** for `pay server demo` and
  `pay server start`. You can also proxy a client call through it with
  `pay --sandbox --debugger curl <url>`.
- **Touch ID on sandbox:** sandbox spends move no real funds and normally don't
  prompt. To force the biometric prompt on camera, set `auth_required: true` on
  the localnet account in `~/.config/pay/accounts.yml` (see the `[INTERNAL]` tip
  at the bottom).
- **Networks:** `--sandbox` = hosted Surfpool localnet (auto-funded ephemeral
  wallet). `--mainnet` = real funds. `--local` = your own Surfpool on `:8899`.

---

## Episode 1 — Getting Started with pay

**Duration:** 2:30
**Companion doc:** <https://pay.sh/docs/get-started/client-quickstart>
**Install doc:** <https://pay.sh/docs/toolchain/install>

### Scene 1 — Cold open (0:00–0:15)

You all know the error code 404! Page not found. But there is a new Error code that has been in the HTTP specs for a long time. Its 402 - Payment required. And it is used by many services already. For example, you can already pay for Google Cloud services — translation, BigQuery, Vision — through 402 requests, with stablecoins, no Google account or API key required. Normally you would need a complicated setup to pay for these services. But with the new Tool called Pay.sh it becomes super easy and even your AI agents can pay for almost anything on the internet now.
In the video series I will explain you how to use pay.sh and in the end you and your agents will be able to pay for services and you will be able to setup and publish your own paid APIs to the world.

### Scene 2 — Install (0:15–0:55)

- 🎙️ "Pay ships as a single binary, and you can install it with either Homebrew
  or npm, whichever you already use. Once it's installed, let's confirm it landed."
- 🖥️ Lower-third: `brew install pay`
- ⌨️ You run:

```sh
brew install pay
pay --version
```

- 🎙️ "If `pay --version` prints a version number, the installation worked and
  there's nothing else to set up."

### Scene 3 — The 402 wall (0:55–1:25)

- 🎙️ "Let me show you the problem first. If I make a plain curl request to a
  paywalled endpoint, the server answers with a 402."
- ⌨️ You run:

```sh
curl -i https://debugger.pay.sh/mpp/quote/AAPL
```

- 🖥️ Highlight the `HTTP/1.1 402 Payment Required` line.

### Scene 4 — The paid call (1:25–2:10)

- 🎙️ "Now I'll put pay in front of the exact same request, in sandbox mode. Pay
  catches that 402, signs a stablecoin transfer for me, and replays the request
  automatically. Because we're on sandbox, no real money moves."
- 🖥️ Lower-third: `pay --sandbox curl <url>`
- ⌨️ You run:

```sh
pay --sandbox curl https://debugger.pay.sh/mpp/quote/AAPL
```

- 🎙️ (If you enabled `auth_required`) "I approve the spend with Touch ID, and the
  request comes back as a 200 with the quote I asked for."

### Scene 5 — Takeaway (2:10–2:30)

- 🎙️ "And that's the whole thing. You've installed pay and made a paid HTTP
  request, without ever creating a developer account or signing up anywhere. My
  advice is to always start on sandbox like this, and only switch to real funds
  once you've seen the flow work end to end."
- 🖥️ Outro card: `brew install pay` + `pay.sh/docs`.

### Description bullets

- 📦 Install via Homebrew or npm
- 🌐 Watch a naked request hit `402 Payment Required`
- 💸 Make your first paid call on the sandbox
- 🔐 Approve the spend with Touch ID — no funds move on sandbox

### Accuracy notes

- Canonical first call in the docs is `pay --sandbox curl …` (sandbox auto-funds
  an ephemeral wallet on first use — no `pay setup` needed for sandbox).
- `pay setup` is for **mainnet** wallet creation + MCP config. Mainnet payment
  commands auto-run it on first use. Don't imply setup is required to follow
  along on sandbox.

---

## Episode 2 — Wrapping curl, wget, http, and fetch

**Duration:** 2:00
**Companion doc:** <https://pay.sh/docs/using-pay/pass-through-commands>

### Scene 1 — Cold open (0:00–0:15)

- 🎙️ "Pay doesn't replace the tools you already use — it wraps them. Whatever
  HTTP client you reach for, pay runs in front of it, catches the 402, signs the
  payment, and retries the request. The URL, the headers, and the body all stay
  exactly the same."

### Scene 2 — Same curl, with and without (0:15–0:50)

- 🖥️ Split view: plain curl (402) on top, `pay --sandbox curl` (200) below.
- ⌨️ You run:

```sh
pay --sandbox curl https://debugger.pay.sh/mpp/quote/AAPL
```

- 🎙️ "Everything you type after `curl` gets forwarded to curl exactly as written,
  so you don't have to escape anything differently just because pay is in front."

### Scene 3 — wget and http (0:50–1:20)

- ⌨️ You run:

```sh
pay --sandbox http POST https://debugger.pay.sh/mpp/echo query=test
pay --sandbox wget https://debugger.pay.sh/mpp/quote/AAPL
```

### Scene 4 — Built-in fetch (1:20–1:45)

- 🎙️ "And if you don't have curl on the machine at all, pay has its own HTTP
  client built in. Just use `pay fetch` and there's no external dependency to
  install."
- ⌨️ You run:

```sh
pay --sandbox fetch https://debugger.pay.sh/mpp/quote/AAPL
```

### Scene 5 — Takeaway (1:45–2:00)

- 🎙️ "So you can drop pay in front of almost any workflow that speaks HTTP without
  rewriting any of it. Next, we'll let AI agents do the same thing."

### Description bullets

- 🌀 `pay curl`, `pay wget`, `pay http` — pass-through HTTP clients
- 🚀 `pay fetch` — built-in client, no external dependency
- 🧰 Keep all your existing flags, headers, and bodies
- 🤖 Same model powers `pay claude` / `pay codex` (Episode 4)

### Accuracy notes

- The pass-through list is: `curl`, `wget`, `http`, `claude`, `codex`, `whoami`.
- `pay fetch` is **not** a pass-through — it's pay's own HTTP client. Keep that
  distinction; the planning doc's "pay fetch when a tool isn't in the list" framing
  is correct.
- Moved the `pay claude` beat out of this episode into Episode 4 to avoid
  overlap; this episode is now purely HTTP clients (tighter at 2:00).

---

## Episode 3 — Discovering Paid APIs in the Catalog

**Duration:** 2:30
**Companion doc:** <https://pay.sh/docs/pay-for-apis/discover-providers>
**CLI reference:** <https://pay.sh/docs/toolchain/commands/agents>

### Scene 1 — Cold open (0:00–0:15)

- 🎙️ "There's an open catalog of HTTP-gated APIs that are ready to call. You
  search it, pick a provider, list its endpoints, and pay your way in."

### Scene 2 — Search (0:15–1:00)

- 🖥️ Lower-third: `pay skills search "<task>"`
- ⌨️ You run:

```sh
pay skills search "google"
```

- 🎙️ "I like to search by the task I'm trying to do, rather than by a provider
  name. In this case one of the results is Google Cloud Text-to-Speech, running
  behind a pay gateway."

### Scene 3 — Inspect endpoints (1:00–1:45)

- 🎙️ "Once I've picked a service, I can list its endpoints to see the methods,
  the paths, and the live price. This one has a `voices` resource that's free, and
  a `text` resource that's the paid one that synthesizes speech."
- ⌨️ You run:

```sh
pay skills endpoints solana-foundation/google/texttospeech voices
pay skills endpoints solana-foundation/google/texttospeech text
```

- 🖥️ The on-camera output shows the real endpoint(s) and current price — let the
  table speak rather than narrating a hardcoded number (prices can change). Note
  the resource tag is the second word after the service (`voices` / `text`), not
  a project ID.

### Scene 4 — Call it (1:45–2:10)

- 🎙️ "Now I can copy the gateway URL straight from the catalog and call it, and
  the payment is handled automatically."
- ⌨️ You run:

```sh
# Gateway URL comes verbatim from the catalog entry above.
pay --sandbox curl https://texttospeech.google.gateway-402.com/openapi.json
```

- 🎙️ "This `openapi.json` is the gateway describing itself, which confirms I'm
  hitting the right provider. From here I call the priced `text` endpoint exactly
  the same way, and pay settles the payment for me."

### Scene 5 — Takeaway (2:10–2:30)

- 🎙️ "So you can find a working paid API for almost any task in well under a
  minute. One thing to keep in mind: the catalog is your trust boundary, so
  always check the gateway URL against the listing before you paste it anywhere."

### Description bullets

- 🔍 `pay skills search "<task>"` — fuzzy search the catalog
- 📑 `pay skills endpoints <service> <resource>` — endpoints + pricing
- 🗺️ Catalog is open-source at solana-foundation/pay-skills
- 🤝 Gateway URLs are stable — copy them straight into your code

### Accuracy notes

- **Corrected commands:** it's `pay skills search` and
  `pay skills endpoints <service> <resource>` — there is **no** `pay skills show`.
- **Corrected FQNs:** real catalog entries look like
  `solana-foundation/google/texttospeech`, `paysponge/coingecko`, `quicknode/rpc`,
  `birdeye/data` — **not** `google.maps/v1`. Browse live ones at
  <https://pay.sh/services>.
- **Resource tag gotcha (hit on 2026-06-25):** the `<resource>` arg is the tag pay
  groups a service's endpoints under (shown as `resource: <name>` in
  `pay skills search` output), **not** a Google project ID. For `texttospeech`
  the valid resources are `voices` and `text`. Running
  `pay skills endpoints solana-foundation/google/texttospeech projects` fails with
  `No endpoints found for resource projects` — `projects` is an empty OpenAPI tag
  with no endpoints attached. Always read the resource name off the search output.
- **Pinned demo (verified live 2026-06-25):** `solana-foundation/google/texttospeech`,
  gateway `https://texttospeech.google.gateway-402.com` (serves `/openapi.json`;
  resources `voices` = free `GET v1/voices`, `text` = paid `POST v1/text:synthesize`).
  Run `pay skills endpoints …` on camera to surface the current price rather than
  hardcoding it. **Note:** `solana-foundation/google/translate` was unpublished as
  of this date (`pay skills search` skips it with "no published endpoints
  available"), which is why the demo was re-pinned off it. Backup providers if
  texttospeech is down on the day: `solana-foundation/google/language` (resource
  `documents`), `solana-foundation/google/speech` (resource `speech`),
  `solana-foundation/google/places` (resource `places`).

---

## Episode 4 — Pay from Claude, Codex, and the Claude Desktop App

**Duration:** 4:00 (was 3:30 — added the real wallet-setup beat in Scene 2)
**Companion doc:** <https://pay.sh/docs/using-pay/pass-through-commands>
**MCP reference:** <https://pay.sh/docs/pay-for-apis/mcp>
**Setup doc:** <https://pay.sh/docs/toolchain/commands/accounts#pay-setup>

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "Wherever you talk to Claude — terminal, desktop, or your IDE — that
  conversation can now pay for live services. Not just coding: a stock quote, a
  weather forecast, an image gen, anything in the catalog. First we'll set up a
  real wallet, then watch one install wire it into every Claude surface on your
  machine."

### Scene 2 — Set up your wallet (0:20–1:05)

This is the one place in the series we create and fund a **real** wallet — every
earlier episode rode on the sandbox's throwaway wallet. `pay setup` does three
things in one step: generates a keypair, seals it in the OS secure store (Apple
Keychain → Touch ID, GNOME Secret Service, or Windows Hello), and writes the
Pay MCP config for every agent client it detects.

- 🖥️ Lower-third: `pay setup`
- ⌨️ You run:

```sh
pay setup
```

- 🎙️ "One command. It generates your keypair, locks it into the OS keychain —
  that's the Touch ID enrollment you're seeing — and wires Pay into every agent
  client on the machine: Claude Code, Codex, the Claude Desktop App, Cursor."
- 🖥️ Show the keychain/Touch ID prompt, then the summary line enumerating which
  agent surfaces were configured.
- 🎙️ "It finishes by opening the funding screen — scan the Solana Pay QR from a
  mobile wallet, or buy stablecoins with PayPal, Venmo, or Apple Pay." Briefly
  show the `pay topup` TUI; you can press `Esc` to skip if you're staying on
  sandbox for the rest of the demo.

> **Already have a wallet?** Re-running setup just to refresh agent config is
> `pay setup --update` — it reinstalls MCP configs **without** creating a new
> account. Use that when a new agent client (e.g. a fresh Cursor install) shows
> up later.

### Scene 3 — Terminal agent (1:05–1:50)

- ⌨️ You run:

```sh
pay --sandbox claude
```

- 🎙️ "This opens a Claude Code session with the pay tools already attached, so I
  can just ask it for something that costs money."
- 🖥️ Type the prompt: _"Get me a real-time stock quote for AAPL using a paid API."_
- 🎙️ "It searches the catalog, picks a provider, fires off the request, hits the
  402, and asks me to authorize the payment. I approve it with Touch ID, and the
  answer streams back into the conversation."

### Scene 4 — Claude Desktop App (1:50–2:50)

- 🎙️ "Now let's do the same thing from the desktop app, on the same machine and
  with the same wallet — and notice there's no terminal involved at all."
- 🖥️ Switch to the Claude macOS app, new chat. Prompt: _"Get me a real-time stock
  quote for AAPL."_ Touch ID prompt appears over the chat window. Approve.

### Scene 5 — Codex + not-just-coding (2:50–3:30)

- 🎙️ "It works the same way with Codex, and this isn't just for coding tasks —
  the agent can pay for anything in the catalog."
- ⌨️ You run:

```sh
pay --sandbox codex
```

- 🖥️ Back in the desktop app, prompt: _"Find a stablecoin yield aggregator and
  tell me which one pays the most on USDC right now."_ Watch discover → pay →
  summarize.

### Scene 6 — Best practice + takeaway (3:30–4:00)

- 🎙️ "The Touch ID prompt is really your kill switch here — if you reject it, the
  payment never happens and the agent comes back to ask you how to proceed. My one
  piece of advice is to connect a wallet with only a small balance to your agent
  sessions, so the most you could ever lose is whatever's in it. With a single
  install, every place you talk to Claude now has a wallet it can spend, but only
  with your approval — and none of it requires you to be writing code."

### Description bullets

- 🤖 **Terminal:** `pay claude` / `pay codex` attach Pay MCP
- 🍎 **Desktop:** the Claude macOS app picks up Pay MCP after `pay setup`
- 🧩 **IDE:** Cursor and any MCP-capable client see the same tools
- 🔐 Every spend triggers a biometric prompt — agents never pay silently
- 🧠 Catalog discovery is built into the session

### Accuracy notes

- **MCP tool names (repo-authoritative, from `skills/pay/SKILL.md`):**
  `search_catalog`, `get_catalog_entry`, `curl`, `get_balance`, `list_catalog`,
  `create_skill`. If you narrate tool names, use these — the website's
  command-reference page lists older `pay.*` names, but the skill the agents
  actually load uses these.
- For feasibility ("can pay do X?") the agent calls `list_catalog`; for a real
  task it calls `search_catalog` with the user's task as the query.
- The agent CLIs are launched as `pay --sandbox claude` / `pay --sandbox codex`
  (network flag before the subcommand).
- **`pay setup` vs `pay setup --update` (important — these are different):**
  bare `pay setup` *creates* a keypair, stores it in the OS keychain (Touch ID),
  and ends by launching `pay topup` to fund it. `--update` only reinstalls MCP
  configs / the agent skill and does **not** create or fund a wallet. This is the
  only episode that shows real wallet creation end-to-end; Episodes 1–3 and the
  sandbox demos run on the auto-funded ephemeral sandbox wallet, and Episode 10
  assumes this account already exists.
- On mainnet, payment commands auto-run `pay setup` on first use if no mainnet
  account is found — so Scene 2 is making that implicit step explicit.

---

## Episode 5 — Your First Paid Gateway

**Duration:** 3:00
**Companion doc:** <https://pay.sh/docs/building-with-pay/getting-started>
**Code:** `code/episode-05-first-gateway/`

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "This whole thing takes two commands. In one terminal we'll serve a
  paywalled API, and in the other we'll pay for it and consume it — and you'll get
  to watch every step of the 402 handshake live in the debugger."

### Scene 2 — Start the demo gateway / Terminal A (0:20–1:00)

- 🖥️ Lower-third: `pay --sandbox server demo`
- ⌨️ You run (Terminal A):

```sh
pay --sandbox server demo
```

- 🎙️ "The `server demo` command ships with a real, bundled spec — it's got
  metered endpoints, payment splits, and tiered pricing already in it. It writes
  that spec out as `pay-demo.yaml`, binds the gateway to localhost on port 1402,
  and opens the debugger for you automatically."

### Scene 3 — Open the debugger (1:00–1:20)

- 🖥️ Browser → `http://127.0.0.1:1402/` — empty flow list.

### Scene 4 — Pay a call / Terminal B (1:20–2:10)

- ⌨️ You run (Terminal B):

```sh
pay --sandbox curl http://127.0.0.1:1402/api/v1/reports/usage
```

- 🎙️ "If I called that same URL without pay, I'd just get a 402. But with pay,
  the wallet signs a one-cent USDC transfer on the sandbox, the request retries,
  and this time it comes back as a 200."

### Scene 5 — Watch the flow (2:10–2:40)

- 🖥️ Switch to the debugger; the flow appears as a row. Click in: client request,
  402 challenge, payment accepted, 200 response.

### Scene 6 — (Optional) your own spec (2:40–3:00)

- 🎙️ "And if you want your own gateway instead of the demo, it's just a single
  file." Show `code/episode-05-first-gateway/starter.yml`.
- ⌨️ You run:

```sh
pay --sandbox server start starter.yml
```

- 🎙️ "So you can stand up a working paid gateway with one command, and watch the
  entire protocol exchange happen end to end."

### Description bullets

- 🚀 `pay --sandbox server demo` — full gateway with sample endpoints
- 💸 `pay --sandbox curl …` — pay the paywall as a subscriber
- 🔭 Embedded Payment Debugger at `127.0.0.1:1402`
- 🌐 The pull-mode 402 flow, explained on screen

### Accuracy notes

- The demo endpoint path is `/api/v1/reports/usage` (matches the docs example).
- Debugger is automatic under `--sandbox` for both `server demo` and
  `server start` — you do **not** pass `--debugger` on the server in sandbox.
- The flow shown is **pull mode** (client signs an authorization; the gateway
  broadcasts). Push mode is a session-payments topic, out of scope here.

---

## Episode 6 — Pricing Endpoints: per call, tokens, tiers, variants

**Duration:** 2:30
**Companion doc:** <https://pay.sh/docs/building-with-pay/pricing>
**Code:** `code/episode-06-pricing/pricing.yml`

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "A real API usually has more than one price. Tokens cost differently from
  whole calls, output is often pricier than input, and high volume tends to earn a
  discount. The `metering` block lets you express all of that, and you don't write
  any code to do it."

### Scene 2 — Per-call (0:20–0:55)

- 🖥️ Open `pricing.yml`, scroll to `v1/search`.
- 🎙️ "Here's the simplest case. There's one dimension that measures usage, a scale
  of one, and a single tier priced at a penny — so that's just one cent per call."
- ⌨️ You run:

```sh
pay --sandbox server start pricing.yml
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/search -d '{"q":"test"}'
```

### Scene 3 — Token pricing (0:55–1:35)

- 🖥️ Scroll to `v1/generate`.
- 🎙️ "This one bills the way an LLM API does, with separate dimensions for input
  and output. A scale of one million means the price covers a million tokens, so
  here it's fifty cents per million tokens in, and a dollar fifty per million out."

### Scene 4 — Volume tiers + variants (1:35–2:10)

- 🖥️ Scroll to `v1/enrich` (tiers) and `v1/infer` (variants).
- ⌨️ You run:

```sh
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/infer -d '{"model":"pro"}'
```

- 🎙️ "With volume tiers, the first tier that matches is the one that applies, and
  the last tier leaves off the `up_to` value so it covers everything above the
  others. And variants let a field in the request itself — here it's the model —
  decide which price you pay."

### Scene 5 — Takeaway (2:10–2:30)

- 🎙️ "So you can price any endpoint however it makes sense — per call, per token,
  per page, per byte. There's one rule to remember: the price divided by the scale
  has to stay above a millionth of a dollar, because stablecoins only have six
  decimal places. Go below that and validation will fail."

### Description bullets

- 💰 `unit: requests` for simple per-call pricing
- 🧮 `direction: input` / `output` for LLM-style billing
- 📈 `tiers:` with `up_to` for volume discounts
- 🎚️ `variants:` for per-model pricing

### Accuracy notes

- **Corrected schema:** metering is `metering.dimensions[]` with
  `direction`/`unit`/`scale`/`tiers`. The planning doc's flat `unit: requests`
  shape is wrong — see `pricing.yml` for the verified shape.
- `accounting: per_agent` advances volume tiers per caller; `pooled` is the
  default shared counter.

---

## Episode 7 — Recurring Revenue with Subscriptions

**Duration:** 3:00
**Companion doc:** <https://pay.sh/docs/building-with-pay/subscriptions/concept>
**YAML spec:** <https://pay.sh/docs/building-with-pay/subscriptions/yaml-specification>
**Code:** `code/episode-07-subscriptions/subscription.yml`

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "If your product bills monthly, charging for every single call is just
  friction. A `subscription` block replaces that pay-every-time loop with a single
  commitment the customer signs once, and then the server pulls each renewal
  on-chain on its own schedule."

### Scene 2 — The block (0:20–0:50)

- 🖥️ Open `subscription.yml`, show the `subscription:` block: `period: 30d`,
  `price_usd: 9.99`, `currency: USDC`.

### Scene 3 — Publish the plan / Terminal A (0:50–1:40)

- ⌨️ You run:

```sh
pay --sandbox server start subscription.yml
```

- 🎙️ "The first time I launch this, pay derives the on-chain plan account and asks
  me to publish it — and on sandbox the rent is covered for me. I say yes, and pay
  writes the plan ID back into the YAML file. Make sure you commit that, because
  it's part of your provider's contract with subscribers."

### Scene 4 — Subscribe / Terminal B (1:40–2:25)

- ⌨️ You run:

```sh
pay --sandbox curl http://127.0.0.1:1402/api/v1/pro/feed
pay --sandbox curl http://127.0.0.1:1402/api/v1/pro/feed
```

- 🎙️ "On the first request I get a 402 with a subscription intent, and Touch ID
  approves both the $9.99 charge and the recurring delegation in a single step. On
  the second request, within the same period, there's no prompt at all — I just
  get the response."

### Scene 5 — Subscriber side (2:25–2:45)

- ⌨️ You run:

```sh
pay subscriptions list
```

- 🎙️ "The subscription is tracked locally with its schedule, the recipient, the
  amount, and its on-chain account. And if you want to inspect or cancel one, the
  `status` and `cancel` commands take that same ID."

### Scene 6 — Takeaway (2:45–3:00)

- 🎙️ "So that's recurring revenue with no card vault, no billing processor, and no
  monthly invoice run. Use a subscription when you're selling access over time —
  and if the value changes from call to call, stick with metering instead."

### Description bullets

- 🔄 `subscription:` — `period: 30d`, `price_usd: 9.99`, `currency: USDC`
- 🪪 On-chain Plan PDA published once, reused forever
- ✍️ One-signature activation; renewals are server-driven
- 🚫 Cancellation honored to end of paid period

### Accuracy notes

- **Verified:** `period: month`/`1m`/`1y` are rejected. Mapped interval must be
  in `[1h, 8760h]`. Use `30d`, `2w`, `52w`.
- **Verified:** subscriber-side commands are `pay subscriptions list / status /
cancel / refresh` (plural `subscriptions`).
- `subscription:` and `metering:` are mutually exclusive on one endpoint.

---

## Episode 8 — Splitting Payments Across Recipients

**Duration:** 2:30
**Companion doc:** <https://pay.sh/docs/accept-payments/payment-splits>
**Code:** `code/episode-08-splits/splits.yml`

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "Marketplaces, affiliates, tax withholding, platform fees — almost every
  real payment ends up getting split somehow. Pay lets you express those splits
  right in the YAML: you name your recipients, and then you route either a
  percentage or a fixed amount to each of them."

### Scene 2 — Named recipients (0:20–0:55)

- 🖥️ Open `splits.yml` or the demo's `pay-demo.yaml`; show the top-level
  `recipients:` map (`partner`, `tax_authority`).
- 🎙️ "You declare your recipients once at the top of the file and then refer to
  them by name everywhere else. The reason that matters is readability — a name
  like `partner` documents itself, whereas a raw public key is just a guessing
  game when you come back to it later."

### Scene 3 — Percentage split (0:55–1:30)

- 🖥️ Show `v1/report` → 20% to partner.
- ⌨️ You run:

```sh
export PARTNER_WALLET=<base58>
export TAX_WALLET=<base58>
pay --sandbox server start splits.yml
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/report -d '{}'
```

### Scene 4 — Fixed + mixed (1:30–2:05)

- 🖥️ Show `v1/invoice` → fixed $0.20 tax + 10% affiliate.
- 🎙️ "Each split uses either an amount or a percent, but never both. And the
  important part is that the splits settle inside the very same on-chain
  transaction as the charge — so either everyone gets paid at once, or the whole
  call fails. There's no in-between state."

### Scene 5 — Takeaway (2:05–2:30)

- 🎙️ "So you can encode every recipient, every percentage, and every fee path of a
  real-world payment in one YAML block, with no payment processor sitting in the
  middle. And if you reference a recipient that doesn't exist, it fails when the
  spec loads — not later, in the middle of a live request."

### Description bullets

- 🪙 Named `recipients:` block — wallet aliases used in `splits:`
- 💴 Fixed-amount or percentage splits, or mixed
- 🎯 Dynamic recipients via `${ENV_VAR}` substitution
- 📊 Per-tier split overrides when tiers differ

### Accuracy notes

- **Verified shape:** `recipients:` is a top-level map; `splits:` lives **inside**
  `metering:`; each split uses one of `amount` or `percent` and a `recipient`
  name. See `splits.yml`.
- Keep total splits below the per-unit price so the operator nets positive.

---

## Episode 9 — Debugging the 402 Handshake

**Duration:** 2:30
**Companion doc:** <https://pay.sh/docs/accept-payments/debugging>

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "When a paid call breaks, you really need to see which step failed — was it
  the challenge, the payment proof, the verification, or the forward to the
  upstream API? The Payment Debugger shows every request that comes in as a row
  you can click into."

### Scene 2 — Two ways to run it (0:20–1:00)

- 🎙️ "There are two ways to run it. You can embed it directly on the gateway, or
  you can run it as a proxy in front of the client."
- ⌨️ You run (embedded, gateway side):

```sh
pay --sandbox server start ../episode-05-first-gateway/starter.yml --debugger
```

- 🖥️ Note: under `--sandbox` the debugger is on by default; `--debugger` is
  explicit here for teaching. UI at `http://127.0.0.1:1402/`.

### Scene 3 — Watch a live flow (1:00–1:45)

- ⌨️ You run (another terminal):

```sh
pay --sandbox curl http://127.0.0.1:1402/v1/reports/usage
```

- 🖥️ Flow appears in real time. Click in: 402 challenge JSON, payment-receipt
  header, response.

### Scene 4 — The client-side proxy (1:45–2:10)

- 🎙️ "For a client you control, you bind the gateway to a different port than
  1402, and then route the call through the debugger proxy instead."
- ⌨️ You run:

```sh
pay --sandbox server start ../episode-05-first-gateway/starter.yml --bind 127.0.0.1:1403
pay --sandbox --debugger curl http://127.0.0.1:1403/v1/reports/usage
```

### Scene 5 — Force a failure + takeaway (2:10–2:30)

- ⌨️ You run:

```sh
curl -i http://127.0.0.1:1403/v1/reports/usage
```

- 🎙️ "A plain call with no payment shows up as a 402-only flow, with no payment
  row at all — which is exactly what an unauthenticated caller looks like. So you
  can diagnose just about any broken paid call in a few seconds, without ever
  digging through server logs."

### Description bullets

- 🛰️ Flow timeline: every challenge / proof / commit / forward as a row
- 🔬 Per-event inspector: headers, body, signature, timing
- 🔄 Live updates as the gateway sees them
- 🧪 Force a 402-only flow to see the unauthenticated case

### Accuracy notes

- **Corrected claim:** the planning doc said client-side `--debugger` on a
  one-shot `pay curl` is useless because the process exits. The docs actually
  document `pay --sandbox --debugger curl <url>` as a supported proxy pattern —
  it launches the proxy on `0.0.0.0:1402` and routes the call through it. Keep
  the nuance: it's most valuable on long-running sessions, but it **does** work
  for one-shots when you bind the gateway off 1402.
- `debugger.pay.sh` is the hosted version with pre-wired sandbox endpoints.

---

## Episode 10 — Managing Your pay Accounts

**Duration:** 3:30
**Companion doc:** <https://pay.sh/docs/using-pay/manage-accounts>
**CLI reference:** <https://pay.sh/docs/toolchain/commands/accounts>

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "One wallet is fine right up until it isn't. Eventually you want a personal
  account for paying, a separate operator account for receiving, a way to move
  stablecoins between them, and a backup — because the OS keychain is convenient,
  but it doesn't sync across machines."

### Scene 2 — What you've got (0:20–0:50)

- ⌨️ You run:

```sh
pay whoami
pay account list
```

- 🎙️ "`whoami` tells me which mainnet account is active right now, and
  `account list` widens that out to show every account across every network,
  along with its balance."

### Scene 3 — Add + switch (0:50–1:30)

- ⌨️ You run:

```sh
pay account new work
pay account default work
pay whoami
```

- 🎙️ "When I create an account, the secret goes straight into the OS keystore, and
  only the public key gets written to `accounts.yml`. Then `default work` makes
  that new account the active one."

### Scene 4 — Move stablecoins (1:30–2:15)

- ⌨️ You run:

```sh
pay --account default push 10 work
```

- 🎙️ "Here I'm pushing 10 USDC from my original account over to `work`. Because
  it's fee-payer–backed, no SOL ever leaves the sender — the pay API co-signs the
  transaction for me. And the receipt shows me the amount, the fee, and a link to
  the explorer."

### Scene 5 — Back up before you fund (2:15–2:55)

- ⌨️ You run:

```sh
pay account export work ./work-backup.json
rm -P ./work-backup.json   # after moving it to 1Password / encrypted USB
```

- 🎙️ "Exporting is your entire backup story, and it matters because the keystore
  doesn't sync through iCloud. If you never export and the machine dies, those
  funds are gone for good."

### Scene 6 — Simulate a new machine (2:55–3:20)

- ⌨️ You run:

```sh
pay account remove work --sandbox --yes
pay --account work whoami            # refuses to sign — keystore entry is gone
pay account import work ./work-backup.json
```

### Scene 7 — Takeaway (3:20–3:30)

- 🎙️ "So that's multiple accounts living on one machine, stablecoins moved
  between them with a single command, and any of them recovered on a brand-new
  machine — all without ever touching the solana CLI or writing down a seed
  phrase."

### Description bullets

- 📇 `pay whoami` / `pay account list`
- ✨ `pay account new <name>`
- 🎯 `pay account default <name>` / global `--account <name>`
- 💸 `pay push <amount> <target>` — fee-payer–backed USDC transfer
- 📦 `pay account export` / ♻️ `pay account import`

### Accuracy notes

- **Corrected ordering:** `--account` is a **global** flag — it goes _before_ the
  subcommand: `pay --account work whoami` (not `pay whoami --account work`).
- **Corrected flag:** removing a non-mainnet account needs the network qualifier:
  `pay account remove work --sandbox --yes`.
- `pay push` and `pay send` are aliases. `pay push max <target>` drains and
  auto-implies `--fee-within`.
- macOS keychain peek: `security find-generic-password -s "pay.sh" -a "keypair:work" -w`.

---

## Episode 11 — From Sandbox to Mainnet

**Duration:** 3:00
**Companion doc:** <https://pay.sh/docs/pay-for-apis/sandbox-and-networks>
**Global flags:** <https://pay.sh/docs/toolchain/global-flags>
**Deploy:** <https://pay.sh/docs/accept-payments/deploy>
**Code:** `code/episode-11-mainnet/provider.mainnet.yml`

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "Sandbox is where you prove the flow works; mainnet is where it actually
  makes money. The cutover comes down to flipping one flag and plugging in real
  signers — and pay's defaults are designed to keep you safe through that
  transition."

### Scene 2 — Production wallet (0:20–0:55)

- ⌨️ You run:

```sh
pay --mainnet whoami
pay topup
```

- 🎙️ "`topup` opens the funding screen, where you can either scan a Solana Pay QR
  code or buy stablecoins directly with PayPal, Venmo, or Apple Pay."

### Scene 3 — The spec diff (0:55–1:45)

- 🖥️ Open `provider.mainnet.yml`. Highlight the changed `operator` block:
  `network: mainnet`, the `signer` block, `rpc_url`, and `recipient`.
- 🎙️ "The endpoints and the pricing are identical — the only thing that changes is
  the operator block. The one rule I'd stress is to never put the signer secret
  inline in the file. For production, the repo recommends using GCP KMS, so you
  set `signer.backend` to `gcp-kms` and point it at the key name and public key
  from your secret manager. For a simpler setup, a file-based keypair works too."

### Scene 4 — Boot on mainnet (1:45–2:30)

- ⌨️ You run:

```sh
pay --mainnet server start provider.mainnet.yml --bind 0.0.0.0:1402
```

- ⌨️ Smoke test (real charge):

```sh
pay --mainnet curl http://<your-host>:1402/v1/reports/usage
```

### Scene 5 — Takeaway (2:30–3:00)

- 🎙️ "So you can take a gateway that already works on sandbox and flip it to
  mainnet without changing a single line of your business logic. A few production
  tips: run the pinned container image, one instance per provider, and bind it to
  your platform's port. Pay doesn't run as a daemon on its own, so put something
  like systemd, pm2, or Cloud Run in front of it. And keep your recipient and
  fee-payer wallets separate, and don't leave much in the operator wallet — it's
  there to receive payments, not to hold a balance."

### Description bullets

- 🔁 `--sandbox` → `--mainnet` — same commands, different network
- ⛽ `operator.signer:` — file keypair or KMS
- 📡 `operator.rpc_url:` — your production RPC
- 🛡️ `fee_payer: true` for gasless customers

### Accuracy notes

- The planning doc linked `/docs/cli/global-flags` (404). Correct page:
  `/docs/toolchain/global-flags`.
- `pay topup` funds mainnet by default; `pay topup --sandbox` funds localnet.
- Default bind is `0.0.0.0:1402`.
- **Signer (repo-authoritative, `monetize-api.md`):** production form is
  `operator.signer.backend: gcp-kms` with `key_name` + `pubkey`; file form is
  `operator.signer.type: file, path: …`. Omitting `signer` uses the active
  `accounts.yml` account.
- **Deploy:** pinned image `ghcr.io/solana-foundation/pay:<version>`, one
  `server start` per provider, secrets via cloud secret manager, OTLP via
  `--otlp-sidecar`. Recommended `operator.currencies.usd: ["USDC","USDT","CASH"]`.

---

## Episode 12 — Publishing to the pay-skills Catalog

**Duration:** 2:30
**Companion doc:** <https://pay.sh/docs/accept-payments/publish-to-pay-skills>
**CLI reference:** <https://pay.sh/docs/toolchain/commands/agents>
**Code:** `code/episode-12-publish/`

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "A gateway that nobody can find is a gateway that nobody pays. The pay-skills
  catalog is the open registry that both agents and humans search to discover paid
  APIs — and getting yours listed is just a single pull request."

### Scene 2 — Generate the entry (0:20–1:00)

- 🎙️ "The first step is to sync your runtime spec into a registry markdown file."
- ⌨️ You run:

```sh
pay skills provider sync ../episode-11-mainnet/provider.mainnet.yml \
  --operator solana-foundation --out providers
```

### Scene 3 — Build, probe, validate (1:00–1:45)

- ⌨️ You run:

```sh
pay skills build . --output /tmp/pay-skills-dist --no-probe
pay skills probe . --files providers/solana-foundation/prod-gateway.md \
  --currencies USDC,USDT --timeout 15 --concurrency 5
pay skills validate . --files providers/solana-foundation/prod-gateway.md \
  --currencies USDC,USDT
```

- 🎙️ "There are three commands here. `build --no-probe` is the fast static check.
  Probe goes a step further and actually calls your gateway. And validate is the
  gate you'd run in CI — it checks your pricing, your currencies, and Solana
  support. When you wire it into CI, you add `--changed-from origin/main --format
  github` so it leaves inline annotations on the pull request. If it's green here,
  it'll be green in CI."

### Scene 4 — PR + confirm discovery (1:45–2:15)

- 🖥️ Open the PR on solana-foundation/pay-skills. After merge:
- ⌨️ You run:

```sh
pay skills update
pay skills search "<your-title>"
```

### Scene 5 — Takeaway (2:15–2:30)

- 🎙️ "So with one merged pull request, your gateway becomes discoverable to every
  pay-enabled agent on the network. My advice is to treat that catalog entry like
  it's your API documentation — stale or wrong metadata will cost you agent
  traffic even faster than actual downtime would."

### Description bullets

- 📂 solana-foundation/pay-skills — the open registry
- 📝 Metadata: title, description, category, gateway URL, endpoints, agent notes
- 🤖 Agent-readiness notes — what makes an entry callable by Claude / Codex
- ✅ `build` / `probe` / `validate` before the PR

### Accuracy notes

- **Corrected commands:** validation is `pay skills build` / `probe` / `validate`
  and metadata is generated via `pay skills provider sync`. There is **no**
  `pay skills lint`.
- Registry markdown is for discovery; the runtime `.yml` is what
  `pay server start` consumes. Keep them in sync.
- **Frontmatter rules (repo `monetize-api.md`):** `description` 64–255 chars and
  must NOT start with `Use for`; `use_case` 32–255 chars and starts with
  `Use for`/`Use when`; `service_url` is a production HTTPS domain; declare
  exactly one of `endpoints:` or `openapi:`. A ready example lives at
  `code/episode-12-publish/providers/solana-foundation/prod-gateway.md`.
- CI flags: `pay skills validate --changed-from origin/main --format github
[--strict]`. Merges re-probe only changed providers via `--only` +
  `--previous-dist`.

---

## [INTERNAL] Demoing without spending mainnet funds

To show the Touch ID prompt on camera without moving real money, edit
`~/.config/pay/accounts.yml` and set `auth_required: true` on the localnet
account you'll use:

```yaml
localnet:
  default:
    keystore: ephemeral
    auth_required: true
```

Strip this note before publishing.

---

## Summary of corrections made vs. the planning doc

| #         | Planning doc said                                               | Reality (verified on pay.sh/docs)                                                                                                     |
| --------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Links     | `docs.pay.sh/...` with `/get-started`, `/using-pay`, `/cli/...` | Domain is `pay.sh/docs/...`; `/cli/*` paths are `/toolchain/commands/*`                                                               |
| Ep 1      | `pay setup` then first call                                     | Sandbox needs no setup; `pay --sandbox curl` auto-funds. `setup` is mainnet/MCP                                                       |
| Ep 3      | `pay skills show <fqn>`, FQN `google.maps/v1`                   | `pay skills endpoints <svc> <resource>`; FQNs like `paysponge/coingecko`. `<resource>` is the OpenAPI tag (e.g. `voices`/`text`), not a project ID; `translate` was unpublished so demo re-pinned to `texttospeech` |
| Ep 6      | flat `unit: requests` metering                                  | `metering.dimensions[]` with `direction`/`unit`/`scale`/`tiers`                                                                       |
| Ep 7      | `pay subscriptions list`                                        | Correct (plural); also `status`/`cancel`/`refresh`                                                                                    |
| Ep 9      | one-shot `--debugger` is useless                                | Supported as a proxy; bind gateway off 1402 and it works for one-shots too                                                            |
| Ep 10     | `pay whoami --account work`, `remove --yes`                     | `--account` is global (precedes subcommand); `remove` needs `--sandbox` qualifier                                                     |
| Ep 11     | `/docs/cli/global-flags`                                        | `/docs/toolchain/global-flags`                                                                                                        |
| Ep 12     | `pay skills lint`                                               | `pay skills build`/`probe`/`validate` + `provider sync`                                                                               |
| Ep 4      | MCP tools `pay.search` / `pay.endpoints` (website)              | `search_catalog`, `get_catalog_entry`, `curl`, `get_balance`, `list_catalog`, `create_skill` (repo `SKILL.md`)                        |
| Ep 5–8,11 | `operator.currencies.usd: ["USDC"]`                             | `["USDC","USDT","CASH"]` recommended; endpoints carry `resource:` (repo fixture)                                                      |
| Ep 11     | `signer: { type: file, path }` only                             | Production form is `signer.backend: gcp-kms` (`key_name`/`pubkey`); file form also valid (repo `monetize-api.md`)                     |
| Ep 12     | generic `build`/`probe`/`validate`                              | `build --no-probe`, `validate --changed-from origin/main --format github --strict`; frontmatter length rules (repo `monetize-api.md`) |

## Nothing impossible found

Every capability the playlist promises is supported by the live product:
install, pass-through, catalog discovery, agent sessions, gateways, metered /
tiered / variant / token pricing, subscriptions, splits, the debugger, account
management, mainnet cutover, and catalog publishing. The only fixes were
command names, flag ordering, schema shapes, and doc URLs — captured above.
