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

What if your AI agent could order you a case of water while you're stuck in a meeting? Well, now it can. You already know 404: Page Not Found. But there's another HTTP status code that's been hiding in the spec for years: 402: Payment Required. Today, you can already pay for services like Google Cloud Translation, BigQuery, and Vision with simple 402 requests using stablecoins—no Google account, API keys, or billing setup required. Until now, integrating payments into apps or AI agents has been difficult. But with pay.sh, it's as easy as making an HTTP request. Your apps—and even your AI agents—can pay for APIs and services across the internet. In this series, I'll show you how to install pay.sh, make your first payment request, and even publish your own paid APIs. Let's get started.

### Scene 2 — Install (0:15–0:55)

- 🎙️ "You can find the docs under pay.sh/docs. Pay ships as a single binary, and you can install it with either Homebrew or npm, whichever you already use. Once it's installed, let's confirm it landed."
- 🖥️ Lower-third: `brew install pay`
- ⌨️ You run:

```sh
brew install pay
pay --version
```

- 🎙️ "If `pay --version` prints a version number, the installation worked and
  there's nothing else to set up."

### Scene 3 — The 402 wall (0:55–1:25)

- 🎙️ "Let me show you the payment requirement first. If I make a plain curl request to a
  paywalled endpoint, the server answers with a 402."
- ⌨️ You run:

```sh
curl https://debugger.pay.sh/mpp/quote/AAPL
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
pay curl https://debugger.pay.sh/mpp/quote/AAPL
```

I have setup may wallet already and told it to require a touch id for spending. Very usefull for later when we pass it to our agents.

### Scene 5 — Takeaway (2:10–2:30)

- 🎙️ "And that's the whole thing. You've installed pay and made a paid HTTP
  request, without ever creating a developer account or signing up anywhere. My
  advice is to always start on sandbox like this, and only switch to real funds
  once you've seen the flow work end to end. We will setup a mainnet wallet in episode 4. There is plenty of interesting services already available in the catalog. I will show you how to discover them and how to pay for them. The real power comes when you let your claude or codex agents use these services. But lets first have a look on all the different ways you can use pay.sh and how it works in the next episode."

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

---

---

---

---

---

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

### Scene 3 — wget and http (0:50–1:20)

- ⌨️ You run:

```sh
pay --sandbox http GET https://debugger.pay.sh/mpp/quote/AAPL
pay --sandbox wget -qO- https://debugger.pay.sh/mpp/quote/AAPL
```

- 🎙️ "Everything you type after `curl` or `wget` or "http" gets forwarded to curl exactly as written,
  so you don't have to escape anything differently just because pay is in front."

- 🎙️ "Same paid endpoint, three different clients. HTTPie pretty-prints the headers
  and the JSON for you, and for wget the only difference is the `-qO-` flag —
  that's wget's own flag for printing the body to the terminal instead of saving
  it to a file. Pay forwards it straight through, which is exactly the point: pay
  never touches your tool's flags, it just handles the payment around them."

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
  rewriting any of it. Before we put pay in front of our claude agent, lets have a look what services are available in the catalogue and how to discover them. "

### Description bullets

- 🌀 `pay curl`, `pay wget`, `pay http` — pass-through HTTP clients
- 🚀 `pay fetch` — built-in client, no external dependency
- 🧰 Keep all your existing flags, headers, and bodies
- 🤖 Same model powers `pay claude` / `pay codex` (Episode 4)

### Accuracy notes

- The pass-through list is: `curl`, `wget`, `http`, `claude`, `codex`, `whoami`.
- **`http` = HTTPie, a separate install (verified 2026-06-25):** pass-through just
  shells out to the named binary, so `pay http …` fails with
  `Command not found: http` unless HTTPie is on `PATH`. Install it first with
  `brew install httpie` (provides `/opt/homebrew/bin/http`). On a clean machine,
  pre-install before recording or cut the `http` beat. `curl` and `wget` ship with
  macOS; `http` does not.
- **Don't use `/mpp/echo` (verified 2026-06-25):** that endpoint returns
  `403 PERMISSION_DENIED — Missing API key or access token`, not a clean paid 200.
  The reliable demo endpoint is `GET /mpp/quote/AAPL`, which returns
  `{"symbol":"AAPL","price":"…","source":"mpp-demo"}`. Use it for all three clients.
- **wget needs `-qO-` on camera (verified 2026-06-25):** bare `pay --sandbox wget
<url>` succeeds (200 + `Payment-Receipt` header), but wget's _default_ is to save
  the body to a file (e.g. `AAPL`, then `AAPL.1` on re-run) rather than print it —
  so the terminal shows a download log, not the quote. `-q` silences the log and
  `-O-` writes the body to stdout, making it read like curl. This is not a pay bug;
  pay forwards the flags verbatim. Good moment to reinforce the pass-through point.
- `pay fetch` is **not** a pass-through — it's pay's own HTTP client. Keep that
  distinction; the planning doc's "pay fetch when a tool isn't in the list" framing
  is correct.
- Moved the `pay claude` beat out of this episode into Episode 4 to avoid
  overlap; this episode is now purely HTTP clients (tighter at 2:00).

---

---

---

---

---

## Episode 3 — Discovering Paid APIs in the Catalog

**Duration:** 3:00 (was 2:30 — added the real mainnet paid call + audio playback)
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

### Scene 4 — Confirm the provider, free (1:45–2:05)

- 🎙️ "Before I pay anything, I'll hit two free endpoints to confirm I'm talking to
  the right gateway. The `openapi.json` is the gateway describing itself, and the
  `voices` endpoint lists what it can do — neither one costs a cent, so they run
  fine on the sandbox."
- ⌨️ You run:

```sh
# Gateway URL comes verbatim from the catalog entry above.
pay --sandbox curl https://texttospeech.google.gateway-402.com/openapi.json
pay --sandbox curl https://texttospeech.google.gateway-402.com/v1/voices
```

### Scene 5 — Make the real paid call (2:05–2:45)

- 🎙️ "Now the real thing. The synthesize endpoint is paid, and this gateway settles
  on mainnet — so I drop the sandbox flag and let it use my real wallet. Watch the
  Touch ID prompt: that's me approving a real, sub-penny stablecoin payment."
- 🖥️ Lower-third: `pay --mainnet curl … /v1/text:synthesize`
- ⌨️ You run:

```sh
pay --mainnet curl -X POST https://texttospeech.google.gateway-402.com/v1/text:synthesize \
  -H 'content-type: application/json' \
  -d '{
    "input": {"text": "Germany will win the world cup this year."},
    "voice": {"languageCode": "en-US", "ssmlGender": "NEUTRAL"},
    "audioConfig": {"audioEncoding": "MP3"}
  }'
```

- 🎙️ "So here we can see now that we get the Response back in base64. We could now go ahead and decode it and play it back. But I have a better idea. Lets use a claude agent to do all of that for us. Discover the service, pay for it, and play the audio back for us. "

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
- **The paid call is MAINNET-ONLY (verified 2026-06-26):** the Google gateways
  (texttospeech, language, speech, places, bigquery) only offer **mainnet** payment
  challenges. `pay --sandbox curl …` on a _paid_ endpoint fails with
  `No MPP challenge matched the active network filter (active: localnet, offered:
mainnet)`. Only the free endpoints (`/openapi.json`, `GET /v1/voices`) succeed on
  sandbox. So Scene 4 confirms the provider for free on sandbox, and Scene 5 does
  the real paid call on `--mainnet` (which also gives us the Touch ID moment).
- **Pricing + cost (verified 2026-06-26):** the decoded 402 reports
  `$30 per 1,000,000 characters`. The Scene 5 demo string is ~57 chars ≈ **$0.0017**
  — trivial. You need a funded mainnet account (the `auth_required: true`
  keychain account → Touch ID). Response is JSON with base64 `audioContent`; decode
  with the Python one-liner and play with `afplay` (macOS built-in).
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

---

---

---

---

## Episode 4 — Pay from Claude, Codex, and the Claude Desktop App

**Duration:** 4:00 (was 3:30 — added the real wallet-setup beat in Scene 2)
**Companion doc:** <https://pay.sh/docs/using-pay/pass-through-commands>
**MCP reference:** <https://pay.sh/docs/pay-for-apis/mcp>
**Setup doc:** <https://pay.sh/docs/toolchain/commands/accounts#pay-setup>

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "Now we come to the real power of pay.sh. Combining it with Large language models like Claude or Codex.
  Wherever you talk to Claude — terminal, desktop, or your IDE — that
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
  bare `pay setup` _creates_ a keypair, stores it in the OS keychain (Touch ID),
  and ends by launching `pay topup` to fund it. `--update` only reinstalls MCP
  configs / the agent skill and does **not** create or fund a wallet. This is the
  only episode that shows real wallet creation end-to-end; Episodes 1–3 and the
  sandbox demos run on the auto-funded ephemeral sandbox wallet, and Episode 9
  assumes this account already exists.
- On mainnet, payment commands auto-run `pay setup` on first use if no mainnet
  account is found — so Scene 2 is making that implicit step explicit.

---

---

---

---

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
  entire protocol exchange happen end to end. In the next chapter we will look into how you can price your endpoints. "

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

---

---

---

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

- 🖥️ Scroll to `v1/enrich` (tiers) and `v1/models/{model}:infer` (variants).
- ⌨️ You run:

```sh
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/models/pro:infer
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/models/fast:infer
```

- 🎙️ "With volume tiers, the first tier that matches is the one that applies, and
  the last tier leaves off the `up_to` value so it covers everything above the
  others. And variants let the model in the URL path — `pro` versus `fast` — decide
  which price you pay: ten cents for pro, one cent for fast."

### Scene 5 — Takeaway (2:10–2:30)

- 🎙️ "So you can price any endpoint however it makes sense — per call, per token,
  per page, per byte. There's one rule to remember: the price divided by the scale
  has to stay above a millionth of a dollar, because stablecoins only have six
  decimal places. Go below that and validation will fail. Now lets see if we can also make this work for subscriptions."

### Description bullets

- 💰 `unit: requests` for simple per-call pricing
- 🧮 `direction: input` / `output` for LLM-style billing
- 📈 `tiers:` with `up_to` for volume discounts
- 🎚️ `variants:` for per-model pricing

### Accuracy notes

- **Corrected schema:** metering is `metering.dimensions[]` with
  `direction`/`unit`/`scale`/`tiers`. The planning doc's flat `unit: requests`
  shape is wrong — see `pricing.yml` for the verified shape.
- **Variants are path-only:** the gateway reads the variant from the URL path,
  and only from the segment right after a literal `models/` or `voices/`. A body
  field like `{"model":"pro"}` is ignored, so the endpoint must be shaped
  `v1/models/{model}:infer` and called as `/v1/models/pro:infer`. With a body
  param the call silently falls back to the first variant ($0.01), which is why
  pro and fast both billed a penny in the earlier draft.
- `accounting: per_agent` advances volume tiers per caller; `pooled` is the
  default shared counter.

---

---

---

---

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

---

---

---

---

## Episode 8 — Splitting Payments Across Recipients

**Duration:** 2:30
**Companion doc:** <https://pay.sh/docs/accept-payments/payment-splits>
**Code:** `code/episode-08-splits/splits.yml`

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "Splitting Payments. 
  Often recieving payments to only on address is not enough. You want to split the payment across multiple addresses.
  Marketplaces, affiliates, tax withholding, platform fees, tips — almost every
  real payment ends up getting split somehow. Pay lets you express those splits
  right in the server YAML: you name your recipients, and then you route either a
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
  spec loads — not later, in the middle of a live request. Pay.sh makes splitting payments very convenient."

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

---

---

## Episode 9 — Managing Your pay Accounts

**Duration:** 3:30
**Companion doc:** <https://pay.sh/docs/using-pay/manage-accounts>
**CLI reference:** <https://pay.sh/docs/toolchain/commands/accounts>

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "So in the last episodes we were always using the same wallet. And one wallet is fine right up until it isn't. Eventually you want a personal account for paying, a separate operator account for receiving, a way to move
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

```

- 🎙️ "When I create an account, the secret goes straight into the OS keystore, and
  only the public key gets written to `accounts.yml`. Then `default work` makes
  that new account the active one."

### Scene 4 — Move stablecoins (1:30–2:15)

- ⌨️ You run:

```sh
pay send 0.01 work --currency USDC
pay account default work
pay whoami
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

---

---

## Episode 10 — Deploy a Paid Gateway (Vercel + Next.js)

**Duration:** ~4:30
**Companion doc:** <https://pay.sh/docs/accept-payments/deploy>
**Vercel reference:** <https://vercel.com/blog/dockerfile-on-vercel>
**Deploy reference:** bundled `.agents/skills/pay/references/monetize-api.md` → "Production Deployment"
**Code:** `code/episode-10-deploy-vercel/`
**Live demo:** <https://paysh-video.vercel.app>

> **Track:** producer. This is the "now put it on the internet" episode — it
> pairs with Episode 11 (publish to the catalog).
> Everything shown runs on **mainnet**; keep real charges tiny ($0.01/call).

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "Every gateway so far has been running on localhost. That's great for
  building — but a gateway on `127.0.0.1` is a gateway nobody can pay. Today we
  put one on the public internet, right next to a normal Next.js app. On Vercel
  these are two separate projects — the Next.js app on one domain, the gateway
  container on another — joined by a `/pay/*` rewrite so the app domain acts as a
  single front door. Then we actually pay it, from the terminal and from the
  browser."
- 🖥️ Split screen for 1 second: `localhost:1402` on the left,
  `paysh-video.vercel.app` on the right. Cut to terminal.

### Scene 2 — The app and the API (0:20–0:55)

- ⌨️ Show `app/api/forecast/route.ts` (the real API) and `app/page.tsx` (the
  frontend) side by side, then open `provider.yml`'s `routing` block:

```yaml
routing:
  type: proxy
  url: '${UPSTREAM_ORIGIN}/api/'
  auth:
    method: header
    key: x-gateway-secret
    value_from_env: GATEWAY_SHARED_SECRET
```

- 🎙️ "Here's the whole app: a Next.js frontend, and a real API at
  `/api/forecast`. The gateway sits in front of that route as a paywall. Two
  separate auth layers: the caller pays me in USDC — no key. And the gateway
  injects a shared secret *after* payment clears, which the route checks. So if
  you hit `/api/forecast` directly, you get a 403 — you can't skip the paywall."
- 🖥️ Lower-third: `two auth layers: caller pays crypto · gateway injects the secret`

### Scene 3 — The container (0:55–1:35)

- ⌨️ Open `Dockerfile.vercel`:

```docker
FROM ghcr.io/solana-foundation/pay:latest

COPY --chmod=0755 entrypoint.sh /app/entrypoint.sh
COPY --chmod=0644 provider.yml  /app/provider.yml

# Bind the privileged $PORT (Vercel uses 80); the base image's `pay` user can't.
USER root

# Base image sets ENTRYPOINT ["pay"]; replace it with our boot script.
ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]
```

- 🎙️ "The gateway is just a container that listens on a port. Vercel's only rule
  is: listen on `$PORT`. I pin the official pay image, copy in my spec and a small
  boot script, and run as root so it can bind port 80. The same image runs on
  Cloud Run, Fly, or a VM — Vercel isn't special, it's just the host I'm picking."
- ⌨️ Flash `entrypoint.sh` and call out what it does — the honest part:

```sh
# entrypoint.sh (abridged)
pay server start "$SPEC_RUNTIME" \
  --bind "0.0.0.0:$PORT" \
  --rpc-url "$PAY_RPC_URL" \
  --recipient "$PAY_PAYMENT_RECIPIENT"
```

- 🎙️ "pay reads most config straight from flags and env: the RPC and recipient go
  in as flags, the shared secret is read from the environment. The one thing it
  can't source itself is the proxy target, so the script drops `UPSTREAM_ORIGIN`
  into the spec at boot. And if anything's misconfigured, it logs the reason and
  idles instead of crash-looping — so the error is readable in Vercel's logs."
- 🖥️ Lower-third: `the only rule: bind $PORT`

### Scene 4 — One front door with a Next.js rewrite (1:35–2:05)

- ⌨️ Open `next.config.js`, highlight the rewrite:

```js
async rewrites() {
  return [
    { source: "/pay/:path*", destination: `${gatewayBaseUrl()}/:path*` },
  ];
}
```

- 🎙️ "The app and the gateway are two separate Vercel projects on two domains —
  Vercel won't run a Next.js app and a container in the same project. But this
  rewrite hides that: anything under `/pay` on my app domain is proxied to the
  gateway's own domain, so callers get a single front door. The gateway domain
  still works directly too — both hit the same container. The `gatewayBaseUrl()`
  helper just trims stray whitespace and adds `https://` if it's missing —
  because a newline pasted into a dashboard env var will otherwise break the
  build. Small paper-cut, worth guarding."
- 🖥️ Lower-third: `two projects, two domains · /pay/* proxies to the gateway`

### Scene 5 — Deploy + inject secrets (2:05–2:45)

- ⌨️ You run:

```sh
vercel deploy
```

- 🎙️ "Vercel builds the image, stores it, and autoscales it on Fluid compute.
  The secrets go in as project environment variables — nothing sensitive is baked
  into the image."
- 🖥️ Show the Vercel env-var screen briefly:
  `GATEWAY_SHARED_SECRET`, `UPSTREAM_ORIGIN`, `GATEWAY_URL`, `PAY_RPC_URL`,
  `PAY_PAYMENT_RECIPIENT`, `PAY_SIGNER_KEYPAIR`.
- 🎙️ "For this demo the fee-payer wallet is a `file` signer — the keypair comes in
  as `PAY_SIGNER_KEYPAIR` and the container writes it to a temp file at boot.
  Treat that as a *hot wallet*: keep a few dollars on it, sweep the rest, and move
  to a KMS signer before it holds anything real. KMS needs a custom pay build, so
  it's not in the stock image — I'll cover that when we harden this."
- 🖥️ Lower-third: `hot wallet for the demo → KMS before real money`

### Scene 6 — Demo: pay it from the terminal (2:45–3:40)

- ⌨️ First, prove the paywall is real — an unpaid request and a direct hit:

```sh
# Unpaid → clean 402 with the challenge intact
http GET https://paysh-video.vercel.app/pay/forecast

# Direct API hit → 403 (paywall can't be bypassed)
curl -i https://paysh-video.vercel.app/api/forecast
```

- 🎙️ "A naked request comes back as a clean 402 — payment required — with the
  challenge in the `Www-Authenticate` header. And hitting `/api/forecast`
  directly? 403. There's no way around the paywall."
- ⌨️ Now pay it for real through `pay`:

```sh
pay --mainnet curl https://paysh-video.vercel.app/pay/forecast
```

- 🖥️ Touch ID prompt appears → approve → forecast JSON lands with a 200.
- 🎙️ "One command. `pay` sees the 402, reads the challenge — a one-cent USDC
  charge on mainnet — builds the payment, and Touch ID gates the signature. I
  approve, it retries with the proof, the gateway verifies on-chain, injects the
  secret, forwards to my own `/api/forecast`, and the forecast comes back. I just
  paid a cent for an API call with no key, no signup, no invoice."
- 🖥️ Lower-third: `402 → Touch ID → 200 · one command`

### Scene 7 — Demo: from the browser (3:40–4:15)

- 🖥️ Open <https://paysh-video.vercel.app> in the browser. Type a city, click
  **Get forecast**.
- 🎙️ "Same endpoint from the browser. The page hits `/pay/forecast` — and gets
  the 402. A plain browser has no wallet, so it can't pay; it just shows the
  paywall. That's the point: the paywall is the same for everyone, browser or
  agent."
- 🖥️ Status line updates to: `402 Payment Required — the paywall works. Call it
  through pay to complete payment.` The page shows the exact CLI commands.
- 🎙️ "The site itself tells you how to pay it — copy the `pay --mainnet curl`
  command, run it, and you're through. Browser to show the wall, `pay` to walk
  through it."

### Scene 8 — Takeaway (4:15–4:30)

- 🎙️ "So that's a real paid API on the public internet, sharing a domain with a
  Next.js app, settling USDC on mainnet — paid from the terminal in one command,
  and showing its paywall in the browser. The exact same container runs anywhere
  that hosts a Dockerfile. Next episode, we make it discoverable in the catalog."

### Description bullets

- 🐳 `Dockerfile.vercel` — run `pay server start` on `$PORT`, autoscaled on Fluid compute
- 🔀 `routing.type: proxy` — paywall in front of the app's own `/api/forecast` route
- 🌐 Two Vercel projects/domains — a Next.js rewrite proxies the app's `/pay/*` to the gateway domain (single front door)
- 🔐 Secrets as env vars (never in the image); `file` signer for the demo, KMS for prod
- 💳 Live demo — pay the mainnet gateway from the terminal (Touch ID) and hit the paywall from the browser

### Accuracy notes

- **Two auth layers are the core concept.** Caller ↔ gateway is paid with crypto
  (no key). Gateway ↔ API is a shared secret (`x-gateway-secret`), injected
  *after* payment via `routing.auth.value_from_env` and validated by the route.
  Unpaid requests 402 and never reach the API; direct `/api/forecast` hits 403.
- **`endpoints[]` is also an allowlist** — unlisted method+path returns 404.
- **How config reaches pay (matches `entrypoint.sh`):** `--rpc-url` and
  `--recipient` are CLI flags; `GATEWAY_SHARED_SECRET` is read from the env via
  `value_from_env`; only `routing.url` (`UPSTREAM_ORIGIN`) is substituted into the
  spec at boot, because it has no flag or env fallback.
- **Signer is `file`, not KMS, in this build.** The stock
  `ghcr.io/solana-foundation/pay:latest` image is not compiled with `gcp_kms`, so
  the demo uses a `file` signer fed by `PAY_SIGNER_KEYPAIR` (a hot wallet).
  Migrate to KMS (custom build, or run on Cloud Run) before it holds real value.
- **Currency ordering matters.** `operator.currencies.usd` leads with the coin
  callers hold (USDC here). If the gateway advertises a currency the payer wallet
  doesn't hold, the client rejects with "not enough balance for any advertised MPP
  challenge" — even though the fee-payer sponsors the SOL fee. Changing the list
  requires a redeploy (it's baked into the image spec).
- **Host-agnostic.** `pay server start --bind 0.0.0.0:$PORT` is the universal
  form; Cloud Run/Fly/Railway/VM differ only in secret injection and process
  supervision (pay does not daemonize itself). Off Vercel, the app and gateway
  are usually two deployments joined by `UPSTREAM_ORIGIN`.
- **Vercel containers are stateless + autoscaled:** keep the signer external
  (KMS) for prod, expect cold starts on scale-to-zero, and don't rely on the
  embedded debugger (in-memory, per-instance). Use `--otlp-sidecar` for prod
  observability. To inspect the *live* flow, run the debugger on your machine:
  `pay --mainnet --debugger curl <url>`, then open `http://127.0.0.1:1402/`.
- **Verify 402 passthrough first** — the highest-risk item on any managed edge.
- App builds clean on Next.js 15 (`npm run build`). Commands verified against
  the `pay` image (`ghcr.io/solana-foundation/pay:latest`) and the "Production
  Deployment" section of `monetize-api.md`.
  Forecast data is deterministic demo output — swap the route body for a real
  data source.

---

## Episode 11 — Publishing to the pay-skills Catalog

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

## Episode 13 — Confidential transfers

TODO:

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

| #         | Planning doc said                                               | Reality (verified on pay.sh/docs)                                                                                                                                                                                   |
| --------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Links     | `docs.pay.sh/...` with `/get-started`, `/using-pay`, `/cli/...` | Domain is `pay.sh/docs/...`; `/cli/*` paths are `/toolchain/commands/*`                                                                                                                                             |
| Ep 1      | `pay setup` then first call                                     | Sandbox needs no setup; `pay --sandbox curl` auto-funds. `setup` is mainnet/MCP                                                                                                                                     |
| Ep 3      | `pay skills show <fqn>`, FQN `google.maps/v1`                   | `pay skills endpoints <svc> <resource>`; FQNs like `paysponge/coingecko`. `<resource>` is the OpenAPI tag (e.g. `voices`/`text`), not a project ID; `translate` was unpublished so demo re-pinned to `texttospeech` |
| Ep 6      | flat `unit: requests` metering                                  | `metering.dimensions[]` with `direction`/`unit`/`scale`/`tiers`                                                                                                                                                     |
| Ep 7      | `pay subscriptions list`                                        | Correct (plural); also `status`/`cancel`/`refresh`                                                                                                                                                                  |
| Ep 9      | one-shot `--debugger` is useless                                | Supported as a proxy; bind gateway off 1402 and it works for one-shots too                                                                                                                                          |
| Ep 9      | `pay whoami --account work`, `remove --yes`                     | `--account` is global (precedes subcommand); `remove` needs `--sandbox` qualifier                                                                                                                                   |
| Ep 11     | `/docs/cli/global-flags`                                        | `/docs/toolchain/global-flags`                                                                                                                                                                                      |
| Ep 11     | `pay skills lint` / `build`/`probe`/`validate` / `provider sync` | **Publish flow is `pay catalog`:** `pay catalog scaffold <fqn> <openapi-url>` → edit `providers/<fqn>/PAY.md` → `pay catalog check …`. `pay catalog build` is main-branch CI only. `skills build/probe/validate/provider sync` never existed in the binary |
| Ep 4      | MCP tools `pay.search` / `pay.endpoints` (website)              | `search_catalog`, `get_catalog_entry`, `curl`, `get_balance`, `list_catalog`, `create_skill` (repo `SKILL.md`)                                                                                                      |
| Ep 5–8,11 | `operator.currencies.usd: ["USDC"]`                             | `["USDC","USDT","CASH"]` recommended; endpoints carry `resource:` (repo fixture)                                                                                                                                    |
| Ep 10–11  | `signer: { type: file, path }` only                             | Production form is `signer.backend: gcp-kms` (`key_name`/`pubkey`); file form also valid (repo `monetize-api.md`)                                                                                                   |
| Ep 11     | generic `build`/`probe`/`validate`                              | `build --no-probe`, `validate --changed-from origin/main --format github --strict`; frontmatter length rules (repo `monetize-api.md`)                                                                               |

## Nothing impossible found

Every capability the playlist promises is supported by the live product:
install, pass-through, catalog discovery, agent sessions, gateways, metered /
tiered / variant / token pricing, subscriptions, splits, the debugger, account
management, mainnet cutover, and catalog publishing. The only fixes were
command names, flag ordering, schema shapes, and doc URLs — captured above.
