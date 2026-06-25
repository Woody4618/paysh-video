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

- 🎙️ "One binary. Homebrew or npm — pick your poison. Then prove it landed."
- 🖥️ Lower-third: `brew install pay`
- ⌨️ You run:

```sh
brew install pay
pay --version
```

- 🎙️ "`pay --version` is the canary. If it prints, you're done installing."

### Scene 3 — The 402 wall (0:55–1:25)

- 🎙️ "Here's the wall. A naked curl against a paywalled endpoint comes back 402."
- ⌨️ You run:

```sh
curl -i https://debugger.pay.sh/mpp/quote/AAPL
```

- 🖥️ Highlight the `HTTP/1.1 402 Payment Required` line.

### Scene 4 — The paid call (1:25–2:10)

- 🎙️ "Now put `pay` in front, in sandbox mode. It catches the 402, signs a
  stablecoin transfer, and replays the request. No real funds move on sandbox."
- 🖥️ Lower-third: `pay --sandbox curl <url>`
- ⌨️ You run:

```sh
pay --sandbox curl https://debugger.pay.sh/mpp/quote/AAPL
```

- 🎙️ (If you enabled `auth_required`) "Touch ID approves the spend…" → "200 OK,
  and the quote comes back."

### Scene 5 — Takeaway (2:10–2:30)

- 🎙️ "That's it. You installed pay and made a paid HTTP request without ever
  creating a developer account. Sandbox first — always — then we can add the auth_required flag when we're ready for real funds."
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

- 🎙️ "pay doesn't replace your tools. It wraps them. Whatever HTTP client you
  already use, pay runs in front, catches the 402, signs, and retries — same URL,
  same headers, same body."

### Scene 2 — Same curl, with and without (0:15–0:50)

- 🖥️ Split view: plain curl (402) on top, `pay --sandbox curl` (200) below.
- ⌨️ You run:

```sh
pay --sandbox curl https://debugger.pay.sh/mpp/quote/AAPL
```

- 🎙️ "Everything after `curl` is forwarded verbatim. You don't escape it
  differently for pay."

### Scene 3 — wget and http (0:50–1:20)

- ⌨️ You run:

```sh
pay --sandbox http POST https://debugger.pay.sh/mpp/echo query=test
pay --sandbox wget https://debugger.pay.sh/mpp/quote/AAPL
```

### Scene 4 — Built-in fetch (1:20–1:45)

- 🎙️ "No curl on the box? `pay fetch` is the built-in client — no external
  dependency."
- ⌨️ You run:

```sh
pay --sandbox fetch https://debugger.pay.sh/mpp/quote/AAPL
```

### Scene 5 — Takeaway (1:45–2:00)

- 🎙️ "Drop pay in front of any HTTP-speaking workflow without rewriting it.
  Agents are next."

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

- 🎙️ "There's an open catalog of HTTP-gated APIs ready to call. Search it, pick
  a provider, list its endpoints, and pay your way in."

### Scene 2 — Search (0:15–1:00)

- 🖥️ Lower-third: `pay skills search "<task>"`
- ⌨️ You run:

```sh
pay skills search "translate text" --category translation
```

- 🎙️ "Search by task, not just by name. Filter by category to narrow it." The
  result includes **`solana-foundation/google/translate`** — Google Cloud
  Translation, fronted by a pay gateway.

### Scene 3 — Inspect endpoints (1:00–1:45)

- 🎙️ "Pick a service, then list its endpoints — methods, paths, and the live
  price."
- ⌨️ You run:

```sh
pay skills endpoints solana-foundation/google/translate projects
```

- 🖥️ The on-camera output shows the real endpoint(s) and current price — let the
  table speak rather than narrating a hardcoded number (prices can change).

### Scene 4 — Call it (1:45–2:10)

- 🎙️ "Copy the gateway URL straight from the catalog and call it. Payment is
  automatic."
- ⌨️ You run:

```sh
# Gateway URL comes verbatim from the catalog entry above.
pay --sandbox curl https://translate.google.gateway-402.com/openapi.json
```

- 🎙️ "That `openapi.json` is the gateway describing itself — proof you're hitting
  the right provider. From here you call the priced `projects` endpoint the same
  way, and pay settles automatically."

### Scene 5 — Takeaway (2:10–2:30)

- 🎙️ "You can find a working paid API for almost any task in under 30 seconds —
  and the catalog is the trust boundary. Verify the URL against the listing
  before you paste it anywhere."

### Description bullets

- 🔍 `pay skills search "<task>"` — fuzzy search the catalog
- 📑 `pay skills endpoints <service> <resource>` — endpoints + pricing
- 🗺️ Catalog is open-source at solana-foundation/pay-skills
- 🤝 Gateway URLs are stable — copy them straight into your code

### Accuracy notes

- **Corrected commands:** it's `pay skills search` and
  `pay skills endpoints <service> <resource>` — there is **no** `pay skills show`.
- **Corrected FQNs:** real catalog entries look like
  `solana-foundation/google/translate`, `paysponge/coingecko`, `quicknode/rpc`,
  `birdeye/data` — **not** `google.maps/v1`. Browse live ones at
  <https://pay.sh/services>.
- **Pinned demo (verified live 2026-06-23):** `solana-foundation/google/translate`,
  gateway `https://translate.google.gateway-402.com` (serves `/openapi.json`,
  resource tag `projects`). Run `pay skills endpoints …` on camera to surface the
  current price rather than hardcoding it. Backup providers if it's down on the
  day: `solana-foundation/google/language`, `paysponge/coingecko`, `birdeye/data`.

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

- 🎙️ "Claude Code opens with Pay tools attached. Ask for something paid."
- 🖥️ Type the prompt: _"Get me a real-time stock quote for AAPL using a paid API."_
- 🎙️ "It searches the catalog, picks a provider, fires the request, hits 402,
  asks to authorize. Touch ID. Answer streams back."

### Scene 4 — Claude Desktop App (1:50–2:50)

- 🎙️ "Same machine, same wallet — now the desktop app. No terminal at all."
- 🖥️ Switch to the Claude macOS app, new chat. Prompt: _"Get me a real-time stock
  quote for AAPL."_ Touch ID prompt appears over the chat window. Approve.

### Scene 5 — Codex + not-just-coding (2:50–3:30)

- ⌨️ You run:

```sh
pay --sandbox codex
```

- 🖥️ Back in the desktop app, prompt: _"Find a stablecoin yield aggregator and
  tell me which one pays the most on USDC right now."_ Watch discover → pay →
  summarize.

### Scene 6 — Best practice + takeaway (3:30–4:00)

- 🎙️ "The Touch ID prompt is your kill switch — reject it and the agent loops
  back to ask you what to do. Best practice: connect a **small-balance** wallet to
  agent sessions. One install gives every Claude surface a wallet it can spend
  with your approval. Coding optional."

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

- 🎙️ "Two commands. One terminal serves a paywalled API; the other pays and
  consumes it. You'll watch every step of the 402 handshake live in the debugger."

### Scene 2 — Start the demo gateway / Terminal A (0:20–1:00)

- 🖥️ Lower-third: `pay --sandbox server demo`
- ⌨️ You run (Terminal A):

```sh
pay --sandbox server demo
```

- 🎙️ "`server demo` ships a real bundled spec — metered endpoints, splits, tiered
  pricing — writes `pay-demo.yaml` here, binds on `127.0.0.1:1402`, and opens the
  debugger automatically."

### Scene 3 — Open the debugger (1:00–1:20)

- 🖥️ Browser → `http://127.0.0.1:1402/` — empty flow list.

### Scene 4 — Pay a call / Terminal B (1:20–2:10)

- ⌨️ You run (Terminal B):

```sh
pay --sandbox curl http://127.0.0.1:1402/api/v1/reports/usage
```

- 🎙️ "The same URL without pay returns 402. With pay, the wallet signs a one-cent
  USDC transfer on sandbox and the request retries — 200."

### Scene 5 — Watch the flow (2:10–2:40)

- 🖥️ Switch to the debugger; the flow appears as a row. Click in: client request,
  402 challenge, payment accepted, 200 response.

### Scene 6 — (Optional) your own spec (2:40–3:00)

- 🎙️ "Want your own? It's one file." Show `code/episode-05-first-gateway/starter.yml`.
- ⌨️ You run:

```sh
pay --sandbox server start starter.yml
```

- 🎙️ "Stand up a working paid gateway in one command, and watch the protocol
  exchange end to end."

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

- 🎙️ "A real API has more than one price. Tokens cost different from calls; output
  is pricier than input; volume earns a discount. The `metering` block expresses
  all of it — no code."

### Scene 2 — Per-call (0:20–0:55)

- 🖥️ Open `pricing.yml`, scroll to `v1/search`.
- 🎙️ "Simplest case: `dimensions`, one `usage` dimension, `scale: 1`, one tier at
  a penny."
- ⌨️ You run:

```sh
pay --sandbox server start pricing.yml
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/search -d '{"q":"test"}'
```

### Scene 3 — Token pricing (0:55–1:35)

- 🖥️ Scroll to `v1/generate`.
- 🎙️ "LLM-style: separate input and output dimensions. `scale` one million means
  the price covers a million tokens — fifty cents in, a dollar fifty out."

### Scene 4 — Volume tiers + variants (1:35–2:10)

- 🖥️ Scroll to `v1/enrich` (tiers) and `v1/infer` (variants).
- ⌨️ You run:

```sh
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/infer -d '{"model":"pro"}'
```

- 🎙️ "First matching tier wins; the last tier drops `up_to` so it covers
  everything above. Variants let a request field — here `model` — pick the price."

### Scene 5 — Takeaway (2:10–2:30)

- 🎙️ "Price any endpoint — per call, per token, per page, per byte. One rule:
  keep `price_usd` over `scale` above a millionth of a dollar, or validation
  fails. Stablecoins only have six decimals."

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

- 🎙️ "For products that bill monthly, paying per call is friction. A
  `subscription` block swaps the 402-every-time loop for a one-signature
  commitment — and the server pulls the renewal on-chain on its own schedule."

### Scene 2 — The block (0:20–0:50)

- 🖥️ Open `subscription.yml`, show the `subscription:` block: `period: 30d`,
  `price_usd: 9.99`, `currency: USDC`.

### Scene 3 — Publish the plan / Terminal A (0:50–1:40)

- ⌨️ You run:

```sh
pay --sandbox server start subscription.yml
```

- 🎙️ "First launch derives the on-chain Plan PDA and asks to publish it — sandbox
  covers the rent. Say yes. Pay writes the `plan_id` back into the YAML. Commit
  that — it's part of your provider contract."

### Scene 4 — Subscribe / Terminal B (1:40–2:25)

- ⌨️ You run:

```sh
pay --sandbox curl http://127.0.0.1:1402/api/v1/pro/feed
pay --sandbox curl http://127.0.0.1:1402/api/v1/pro/feed
```

- 🎙️ "First hit: 402 with a subscription intent. Touch ID approves the $9.99
  charge and the recurring delegation in one step. Second hit, same period: no
  prompt — just the response."

### Scene 5 — Subscriber side (2:25–2:45)

- ⌨️ You run:

```sh
pay subscriptions list
```

- 🎙️ "Tracked locally with its schedule, recipient, amount, and PDA. `status` and
  `cancel` take the same id."

### Scene 6 — Takeaway (2:45–3:00)

- 🎙️ "Recurring revenue with no card vault, no billing processor, no invoice run.
  Use subscriptions for access over time; if value varies per call, stay on
  metering."

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

- 🎙️ "Marketplaces, affiliates, tax withholding, platform fees — every real
  payment splits. pay expresses splits as YAML: name your recipients, then route
  a percentage or a fixed amount to each."

### Scene 2 — Named recipients (0:20–0:55)

- 🖥️ Open `splits.yml` or the demo's `pay-demo.yaml`; show the top-level
  `recipients:` map (`partner`, `tax_authority`).
- 🎙️ "Recipients are declared once at the top and referenced by name. `vendor` is
  documentation; a raw pubkey is a guessing game."

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
- 🎙️ "Exactly one of `amount` or `percent` per split. Splits settle inside the
  **same** on-chain transaction as the charge — everyone gets paid atomically, or
  the call fails."

### Scene 5 — Takeaway (2:05–2:30)

- 🎙️ "Encode every recipient, percentage, and fee path of a real-world payment in
  a YAML block — no payment processor in the middle. A missing recipient fails at
  spec load, not at request time."

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

- 🎙️ "When a paid call breaks, you need to see which step failed: the challenge,
  the proof, the verification, or the upstream forward. The Payment Debugger shows
  every request that lands as a clickable row."

### Scene 2 — Two ways to run it (0:20–1:00)

- 🎙️ "Two flavors. Embedded on the gateway, or a proxy in front of the client."
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

- 🎙️ "For a client you control, bind the gateway off 1402 and route the call
  through the debugger proxy."
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

- 🎙️ "A naked call shows a 402-only flow, no payment row — exactly what an
  unauthenticated caller looks like. Diagnose any broken paid call in seconds,
  without reading server logs."

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

- 🎙️ "One wallet is fine until it isn't. A personal account for paying, an
  operator account for receiving, a way to move stablecoins between them, and a
  backup — because the OS keychain is convenient but it doesn't sync."

### Scene 2 — What you've got (0:20–0:50)

- ⌨️ You run:

```sh
pay whoami
pay account list
```

- 🎙️ "`whoami` shows the active mainnet account; `account list` widens it to every
  network and balance."

### Scene 3 — Add + switch (0:50–1:30)

- ⌨️ You run:

```sh
pay account new work
pay account default work
pay whoami
```

- 🎙️ "Secret lands in the OS keystore; only the pubkey is written to
  `accounts.yml`. `default work` makes it active."

### Scene 4 — Move stablecoins (1:30–2:15)

- ⌨️ You run:

```sh
pay --account default push 10 work
```

- 🎙️ "Push 10 USDC from the original account into `work`. Fee-payer–backed: no SOL
  ever leaves the sender — pay-api co-signs. Receipt shows amount, fee, explorer
  link."

### Scene 5 — Back up before you fund (2:15–2:55)

- ⌨️ You run:

```sh
pay account export work ./work-backup.json
rm -P ./work-backup.json   # after moving it to 1Password / encrypted USB
```

- 🎙️ "Export is the entire backup story. The keystore doesn't iCloud-sync; no
  export, dead machine, gone funds."

### Scene 6 — Simulate a new machine (2:55–3:20)

- ⌨️ You run:

```sh
pay account remove work --sandbox --yes
pay --account work whoami            # refuses to sign — keystore entry is gone
pay account import work ./work-backup.json
```

### Scene 7 — Takeaway (3:20–3:30)

- 🎙️ "Multiple accounts on one machine, stablecoins moved in one command, any of
  them recovered on a new machine — no solana-cli, no seed phrase."

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

- 🎙️ "Sandbox proves the flow. Mainnet is where it makes money. The cutover is a
  flag flip plus real signers — and pay's defaults are built to keep you safe
  through the transition."

### Scene 2 — Production wallet (0:20–0:55)

- ⌨️ You run:

```sh
pay --mainnet whoami
pay topup
```

- 🎙️ "`topup` opens the funding TUI — Solana Pay QR, or onramp via PayPal, Venmo,
  Apple Pay."

### Scene 3 — The spec diff (0:55–1:45)

- 🖥️ Open `provider.mainnet.yml`. Highlight the changed `operator` block:
  `network: mainnet`, the `signer` block, `rpc_url`, and `recipient`.
- 🎙️ "Same endpoints, same pricing — only the operator block changes. Never
  inline the signer secret. In production the repo recommends GCP KMS:
  `signer.backend: gcp-kms` with the key name and pubkey from your secret
  manager. A file keypair (`signer.type: file, path: …`) works too for simpler
  setups."

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

- 🎙️ "Flip a working sandbox gateway to mainnet without changing a line of
  business logic. In production, run the pinned container
  (`ghcr.io/solana-foundation/pay:<version>`) one instance per provider, bind the
  platform port, and keep recipient and fee-payer wallets separate. pay doesn't
  daemonize — front it with systemd, pm2, or Cloud Run — and cap the operator
  wallet; it's there to receive, not to hold."

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

- 🎙️ "A gateway nobody can find is a gateway nobody pays. The pay-skills catalog
  is the open registry agents and humans search to discover paid APIs — and adding
  yours is a single PR."

### Scene 2 — Generate the entry (0:20–1:00)

- 🎙️ "Sync your runtime spec into a registry markdown file."
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

- 🎙️ "`build --no-probe` is the fast static check. Probe actually calls your
  gateway. Validate is the CI gate — it checks pricing, currency, and Solana
  support. In CI, add `--changed-from origin/main --format github` for inline PR
  annotations. Green here means green in CI."

### Scene 4 — PR + confirm discovery (1:45–2:15)

- 🖥️ Open the PR on solana-foundation/pay-skills. After merge:
- ⌨️ You run:

```sh
pay skills update
pay skills search "<your-title>"
```

### Scene 5 — Takeaway (2:15–2:30)

- 🎙️ "Make your gateway discoverable to every pay-enabled agent on the network
  with one merged PR. Treat the entry like API docs — outdated metadata loses you
  agent traffic faster than downtime."

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
| Ep 3      | `pay skills show <fqn>`, FQN `google.maps/v1`                   | `pay skills endpoints <svc> <resource>`; FQNs like `paysponge/coingecko`                                                              |
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
