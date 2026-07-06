# pay.sh 101 Series — Screencast Playlist Plan

Short, hands-on, deep-dive screencasts that walk a developer from "I just heard about pay" to "I'm running a paid gateway in production." Each episode is **2–4 minutes**, narrated over real terminal + browser footage, with a single concrete takeaway.

## Series overview

| Field            | Value                                                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Playlist title   | **pay.sh 101 Series**                                                                                                                             |
| Episode length   | 2–4 minutes (cap at 4:00; if it runs long, split)                                                                                              |
| Cadence          | **Burst-record ahead of the Claude conference in Tokyo** — ship as many of the 12 episodes as devrel can produce in time, drop them as one batch, then pick the weekly Tuesday rhythm back up for whatever remains. Episode order on the playlist stays 1 → 12; the order they're *recorded* is devrel's call. |
| Format           | Screen recording of `pay` CLI + Payment Debugger UI + browser; voice-over only (no talking head); chapter markers in the description           |
| Tone             | Confident, action-first, terse. Use real numbers, real outputs, no hand-waving. Borrow Surfpool's "stop fighting X, start shipping Y" cadence. |
| Audience         | Two tracks: (A) developers/agents **calling** paid APIs, (B) developers **running** paid gateways. Episodes 1–4 lean A, 5–12 lean B. Episode 10 (accounts) helps both. |
| Branding         | pay.sh near-black surface, Diatype Mono terminal, white primary action, violet accents. Lower-thirds in mono.                                  |
| Companion docs   | Every episode links to its canonical docs page so viewers can keep going after the video ends.                                                 |

## Story arc — local to production

Two intersecting journeys, ordered so a complete beginner can binge top-to-bottom and a builder-side viewer can skip to episode 5.

```
   CONSUMER TRACK              PRODUCER TRACK              ECOSYSTEM
   ─────────────────           ─────────────────           ─────────
1. Install + first call
2. Wrap any HTTP client
3. Discover paid APIs    ─┐
                          ├─► 4. Pay from any Claude / Codex surface
                          │
                          └─► 5. First paid gateway     ─┐
                              6. Pricing endpoints      │
                              7. Recurring subscriptions│
                              8. Payment splits         │
                              9. Debug the 402 dance    │
                                                        │
                                                        ├─► 10. Manage accounts
                                                        │
                                                        ├─► 11. From sandbox to mainnet
                                                        │
                                                        └─► 12. Publish to the catalog
```

By episode 12 a viewer who started cold should be able to:
1. Install `pay` and make a paid call.
2. Run a gateway, define pricing or a subscription, and verify the flow with the debugger.
3. Maintain multiple local accounts on one machine, move stablecoins between them, and recover any of them on a new machine.
4. Switch from sandbox to mainnet, fund a real recipient, and publish a discoverable provider entry.

## Episode template

Each script below uses the same skeleton — copy this into the YouTube description for consistency with Surfpool:

```
[1-paragraph hook]

[Bulleted "what you'll see" list with emoji marker]

Links
Documentation: https://pay.sh/docs/<slug>
Source: https://github.com/solana-foundation/pay
Catalog: https://github.com/solana-foundation/pay-skills
```

Every script includes:
- **Cold open** — one line that frames the problem.
- **Setup shot** — empty terminal / docs page open, so the viewer sees the starting state.
- **Hands-on steps** — the commands the host runs on camera.
- **Tips & tricks** — one or two callouts a typical first-time user gets wrong.
- **Best practice** — one durable rule of thumb.
- **Takeaway** — the single capability the viewer can now demonstrate.


### TIP when demoing [INTERNAL]
If during your videos, you want to avoid using mainnet funds, but want to see the touch id popup prompting, you can edit `~/.config/pay/accounts.yaml`, and update the setting `auth_required` of the account you'll be using to `true`.
```yaml
localnet:
  default:
    keystore: ephemeral
    auth_required: true
```

---

## Episode 1 — Getting Started with pay

**Duration:** 2:30
**Companion doc:** [/docs/get-started/client-quickstart](https://pay.sh/docs/get-started/client-quickstart)

### Hook
Wrap one binary and any HTTP 402–gated API just works. In two and a half minutes, install `pay`, make your first paid call on the sandbox, and watch your wallet authorize the spend over Touch ID — no API keys, no signup.

### Bullets (description copy)
- 📦 Install via Homebrew or npm
- 🌐 Watch a naked request hit **402 Payment Required**
- 💸 Make your first paid call against the sandbox
- 🔐 Approve the spend with Touch ID — no funds move on sandbox

### Hands-on steps
1. `brew install pay && pay --version` — show the binary lands.
2. `curl -i https://debugger.pay.sh/mpp/quote/AAPL` — naked curl returns **402 Payment Required**.
3. `pay --sandbox curl https://debugger.pay.sh/mpp/quote/AAPL` — sandbox auto-funds an ephemeral wallet, signs, retries, **200 OK** with the quote.

> **Note:** Sandbox needs **no** `pay setup` — it generates and funds an ephemeral wallet on first use. `pay setup` is for **mainnet** (wallet in the OS secure store + MCP config) and auto-runs on the first mainnet payment command. Save it for Episode 4 / mainnet.

### Tips & tricks
- Sandbox mode (`--sandbox`) uses an ephemeral wallet on hosted Surfpool. **No real funds move**. Use it for every example before you touch mainnet.
- `debugger.pay.sh` is our hosted suite of sandbox-friendly paywalled endpoints — call any of them without running a gateway yourself. It's where every "first paid call" demo in this series lands.
- `pay --version` is the canary — if the CLI prints, you don't need anything else.

### Best practice
> Start with `--sandbox`. Only drop the flag when you've verified the flow end-to-end.

### Takeaway
You can install pay and make a paid HTTP request without ever creating a developer account.

---

## Episode 2 — Wrapping curl, wget, Claude, and Codex

**Duration:** 2:00
**Companion doc:** [/docs/using-pay/pass-through-commands](https://pay.sh/docs/using-pay/pass-through-commands)

### Hook
`pay` doesn't replace your tools — it wraps them. Whatever HTTP client or agent you already use, `pay` runs in front, catches the 402, signs, and retries.

### Bullets
- 🌀 `pay curl`, `pay wget`, `pay http` — pass-through HTTP clients
- 🤖 `pay claude`, `pay codex` — agents inherit Pay MCP automatically
- 🚀 `pay fetch` — built-in HTTP client when you don't want a dependency
- 🧰 Keep all your existing flags, headers, and bodies

### Hands-on steps
1. Show the exact same `curl` command with and without `pay` — payload identical, payment side handled transparently.
2. Repeat with `pay --sandbox wget -qO- https://debugger.pay.sh/mpp/quote/AAPL` and `pay --sandbox http GET https://debugger.pay.sh/mpp/quote/AAPL`. (`http` is HTTPie — `brew install httpie` first; `wget` needs `-qO-` to print the body instead of saving it to a file.)
3. `pay fetch https://...` — same URL, no external curl binary needed.
4. `pay claude` — Claude Code session opens with Pay tools attached; ask it to "buy me a quote for AAPL" and watch it discover + pay.

### Tips & tricks
- Arguments after `curl` / `wget` / `http` are forwarded verbatim. Don't escape them differently for `pay`.
- For one-shot calls (`pay curl`, `pay wget`, `pay fetch`) the embedded debugger is on the **gateway** side — see Episode 9. Client-side `--debugger` is only useful for long-running commands like `pay --debugger claude` (Episode 4), where the debugger UI stays up as long as the session does.

### Best practice
> If a tool isn't in the pass-through list, use `pay fetch <url>` instead of piping through `pay` itself. The pass-through verbs are an explicit, audited list — not a generic shell.

### Takeaway
You can drop `pay` in front of any HTTP-speaking workflow without rewriting it.

---

## Episode 3 — Discovering Paid APIs in the Catalog

**Duration:** 2:30
**Companion doc:** [/docs/pay-for-apis/discover-providers](https://pay.sh/docs/pay-for-apis/discover-providers) · [CLI reference](https://pay.sh/docs/toolchain/commands/agents)

### Hook
There's a community catalog of HTTP-gated APIs ready to call. Search it, pick a provider, list its endpoints, and pay your way in.

### Bullets
- 🔍 `pay skills search "<task>"` — fuzzy search the catalog
- 📑 `pay skills endpoints <service> <resource>` — endpoints + pricing
- 🗺️  Catalog is open-source at [solana-foundation/pay-skills](https://github.com/solana-foundation/pay-skills)
- 🤝 Gateway URLs are stable — copy them straight into your code

### Hands-on steps
1. `pay skills search "google"` — table of providers with descriptions, prices, and FQNs. Result includes **`solana-foundation/google/texttospeech`**.
2. `pay skills endpoints solana-foundation/google/texttospeech text` — endpoint list and live pricing. (The `<resource>` arg is the OpenAPI tag pay groups endpoints under — here `voices` (free) or `text` (paid) — **not** a project ID.)
3. Copy the gateway URL and call it directly: `pay --sandbox curl https://texttospeech.google.gateway-402.com/openapi.json` — payment handled automatically on priced endpoints.
4. Show the catalog repo (or [pay.sh/services](https://pay.sh/services)) in the browser — a single PR adds a new provider.

### Tips & tricks
- The skills catalog is the **trust boundary**. Verify the gateway URL against the listing before pasting it anywhere.
- Catalog entries carry agent usage notes — your agent reads these to decide *when* to use the API, not just how.

### Best practice
> When an agent needs a paid API, search the catalog first. Don't let the agent invent a gateway URL — that's how it ends up paying the wrong recipient.

### Takeaway
You can find a working paid API for almost any task in under 30 seconds.

---

## Episode 4 — Pay from Claude, Codex, and the Claude Desktop App

**Duration:** 4:00
**Companion doc:** [/docs/using-pay/pass-through-commands](https://pay.sh/docs/using-pay/pass-through-commands#agent-sessions) · [MCP reference](https://pay.sh/docs/pay-for-apis/mcp) · [`pay setup`](https://pay.sh/docs/toolchain/commands/accounts#pay-setup)

### Hook
Wherever you talk to Claude — terminal, desktop, or IDE — your conversation can now pay for live services. Not just for coding: ask for a weather forecast, a stock quote, an image gen, a search, anything in the catalog. A single `pay setup` creates your wallet, enrolls Touch ID, and wires the Pay MCP server into every Claude surface on your machine. The agent calls, the gateway returns 402, you approve with Touch ID, the answer streams back.

### Bullets
- 🤖 **Terminal:** `pay claude` and `pay codex` wrap the CLI agents and attach Pay MCP.
- 🍎 **Desktop:** the **Claude macOS app** picks up Pay MCP automatically once `pay setup` writes the config.
- 🧩 **IDE / other hosts:** Cursor and any other MCP-capable client see the same tools.
- 🔐 Every spend triggers a biometric prompt — agents never pay silently.
- 🧠 Discovery is built in: the agent searches the pay-skills catalog from inside the session.

### Hands-on steps
1. **Set up your wallet (first-time).** `pay setup` generates a keypair, seals it in the OS keychain (Touch ID enrollment), wires Pay MCP into every detected agent client — Claude Code, Codex, the Claude Desktop App, Cursor — and ends by launching the `pay topup` funding TUI (Solana Pay QR or PayPal/Venmo/Apple Pay onramp). This is the only episode that shows real wallet creation; earlier episodes ran on the sandbox's auto-funded ephemeral wallet.
   - **Already set up?** Use `pay setup --update` instead — it reinstalls MCP config for a newly-added client **without** creating or funding a wallet.
2. **Terminal first.** `pay claude` opens a Claude Code session with Pay tools attached. Prompt: *"Get me a real-time stock quote for AAPL using a paid API."* Agent calls `search_catalog`, picks a provider, fires the request, hits 402, asks for authorization. Touch ID. Response.

> **MCP tool names** (from `skills/pay/SKILL.md`): `search_catalog`, `get_catalog_entry`, `curl`, `get_balance`, `list_catalog`, `create_skill`.
3. **Now switch to the Claude Desktop App** — same machine, same wallet. Start a fresh chat. Same prompt: *"Get me a real-time stock quote for AAPL."* The desktop app already has Pay's tools available; it runs the same flow. Touch ID prompt appears on top of the chat window. Approve. The quote lands in the conversation.
4. **Codex briefly.** `pay codex`. Same flow, OpenAI agent.
5. **Show it isn't just coding.** Prompt from the desktop app: *"Find me a stablecoin yield aggregator and tell me which one currently pays the most on USDC."* Watch the agent discover, call, pay, summarize — no IDE, no terminal, just chat.

### Tips & tricks
- The Touch ID prompt is your kill switch. Reject it and the agent loops back to ask the user how to proceed.
- `pay --debugger claude` records every paid call in the embedded Payment Debugger from the **client's** perspective — invaluable when an agent does something unexpected. The debugger UI stays live for as long as the Claude session is open. (Don't bother with `--debugger` on one-shot commands like `pay curl` — the debugger dies before you can read it.)
- If a new agent client shows up later, run `pay setup --update` again — it adds the new surface without recreating your wallet.

### Best practice
> Cap the wallet you connect to agent sessions. The biometric gate is strong, but the cheapest defense is a small balance — say, what you'd lose with a stolen laptop. Sweep surplus to a cold account with `pay push` (see Episode 10).

### Takeaway
One install gives every Claude surface — terminal CLI, the macOS app, your IDE — a wallet it can spend with your approval. Coding optional.

---

## Episode 5 — Your First Paid Gateway

**Duration:** 3:00
**Companion doc:** [/docs/building-with-pay/getting-started](https://pay.sh/docs/building-with-pay/getting-started)
**Code:** `code/episode-05-first-gateway/`

### Hook
Two commands. One terminal serves a paywalled API; the other pays and consumes it. You see every step of the 402 handshake live in the embedded debugger.

### Bullets
- 🚀 `pay --sandbox server demo` — full gateway with sample endpoints
- 💸 `pay --sandbox curl ...` — activate the paywall as a subscriber
- 🔭 Embedded Payment Debugger at `127.0.0.1:1402`
- 🌐 The 6-step pull-mode 402 flow, explained on screen

### Hands-on steps
1. **Terminal A:** `pay --sandbox server demo` — writes `pay-demo.yaml`, gateway binds on `127.0.0.1:1402`.
2. Open `http://127.0.0.1:1402` in the browser — debugger UI is empty.
3. **Terminal B:** `pay --sandbox curl http://127.0.0.1:1402/api/v1/reports/usage` — 402 → sign → 200.
4. Switch to the debugger; the flow shows up as a row with client request, 402 challenge, payment accepted, and 200 response.

### Tips & tricks
- The demo spec is a *real* spec — open `pay-demo.yaml` and read it. Everything you build later is variations on it.
- The debugger captures every flow. Click through to inspect headers, payment receipts, and timing.
- The gateway-side debugger (`pay server start --debugger`, on by default for `pay server demo`) is the one that persists and captures the full picture. Don't pass `--debugger` on the client side for one-shot calls — the client exits before the debugger UI is reachable. Client-side `--debugger` is only worth it for long-running sessions (Episode 4).

### Best practice
> Always run `pay server demo` once on a new machine before writing your own spec. It's the cheapest way to verify your install, your sandbox wallet, and your debugger render together.

### Takeaway
You can stand up a working paid gateway in one command and watch the protocol exchange end to end.

---

## Episode 6 — Pricing Endpoints: per call, tokens, and tiers

**Duration:** 2:30
**Companion doc:** [/docs/building-with-pay/pricing](https://pay.sh/docs/building-with-pay/pricing)
**Code:** `code/episode-06-pricing/pricing.yml`

### Hook
A real API has more than one price. Tokens cost different from calls; output is pricier than input; volume gets discounts. The `metering:` block expresses all of that without code.

### Bullets
- 💰 `dimensions: [{ direction: usage, unit: requests }]` for simple per-call pricing
- 🧮 `direction: input` / `direction: output` for LLM-style billing
- 📈 `tiers:` with `up_to` for volume discounts
- 🎚️ `variants:` for per-model or per-parameter pricing

### Hands-on steps
1. Open `code/episode-06-pricing/pricing.yml`; show the per-call endpoint — a `metering.dimensions` entry with one tier at `$0.01 per request`.
2. `pay --sandbox server start pricing.yml` — each endpoint advertises its price in the 402 challenge.
3. Show the token-priced endpoint: separate `direction: input` (`tokens`, `scale: 1000000`, `price_usd: 0.50`) and `direction: output` (`scale: 1000000`, `price_usd: 1.50`) dimensions — mirroring an LLM API.
4. Show the volume tiers (`up_to: 1000`, `up_to: 10000`, then unbounded) with `accounting: per_agent` so the per-caller counter shifts the price across calls.

> **Schema note:** metering is `metering.dimensions[]` with `direction` / `unit` / `scale` / `tiers` — there is no flat top-level `unit:` key. See `pricing.yml` for the verified shape.

### Tips & tricks
- `scale` is the count of units one `price_usd` covers. `tokens` at `scale: 1_000_000` means "one dollar per million tokens" — match upstream pricing card-for-card.
- Stablecoins use 6 decimals. If `price_usd / scale` falls below 0.000001 USDC, validation fails. Bump `price_usd` or reduce `scale`.
- Use `accounting: per_agent` to discount based on each caller's history; `pooled` shares the counter across all callers.

### Best practice
> Document your pricing unit in the endpoint `description:`. Agents read that description to decide whether the cost is worth the call.

### Takeaway
You can price any endpoint — per call, per token, per page, per byte, or per any unit your API charges on.

---

## Episode 7 — Recurring Revenue with pay Subscriptions

**Duration:** 3:00
**Companion doc:** [/docs/building-with-pay/subscriptions/concept](https://pay.sh/docs/building-with-pay/subscriptions/concept) · [YAML spec](https://pay.sh/docs/building-with-pay/subscriptions/yaml-specification)
**Code:** `code/episode-07-subscriptions/subscription.yml`

### Hook
For products that bill monthly, per-call payments are friction. `subscription:` swaps the 402-every-time loop for a one-signature commitment — and a renewal worker keeps the recurring charge running on-chain.

### Bullets
- 🔄 `subscription:` block — `period: 30d`, `price_usd: 9.99`, `currency: USDC`
- 🪪 On-chain Plan PDA published once, reused forever
- ✍️ One-signature activation; renewals are server-driven
- 🚫 Cancellation effective at end of the paid period

### Hands-on steps
1. Add a `subscription:` block to a starter spec; price it at `$9.99/30d`.
2. `pay --sandbox server start spec.yml` — interactive prompt to publish the on-chain `Plan` PDA. Approve.
3. `pay --sandbox curl <endpoint>` — first hit returns 402 with `intent: subscription`. Touch ID approves a $9.99 charge atomically with delegation creation. Second hit returns 200 with no prompt.
4. `pay subscriptions list` — the subscription is tracked locally with its PDA.

### Tips & tricks
- `period: month` is **not supported** — calendar months aren't a fixed number of hours. Use `30d` or `4w`.
- `subscription:` and `metering:` are mutually exclusive per endpoint. To offer both, create two endpoints.
- Once a Plan PDA is published, **commit the updated YAML**. The plan id is part of your provider contract — losing it means subscribers can't reuse their delegation.

### Best practice
> Subscription endpoints are for **access over time**. If your unit of value varies per call (tokens, characters, bytes), stick with `metering:`.

### Takeaway
You can ship recurring revenue without a card vault, a billing processor, or a monthly invoice run.

---

## Episode 8 — Splitting Payments Across Recipients

**Duration:** 2:30
**Companion doc:** [/docs/accept-payments/payment-splits](https://pay.sh/docs/accept-payments/payment-splits)
**Code:** `code/episode-08-splits/splits.yml`

### Hook
Marketplaces, affiliates, tax withholding, platform fees — every real payment splits. pay expresses splits as YAML, with fixed amounts, percentages, or runtime-resolved wallets.

### Bullets
- 🪙 Named recipients block — wallet aliases used in `splits:`
- 💴 Fixed-amount splits, percentage splits, or mixed
- 🎯 Dynamic recipients via `${ENV_VAR}` substitution
- 📊 Per-tier splits — different splits at different volume bands

### Hands-on steps
1. Open `code/episode-08-splits/splits.yml` (or the bundled `pay-demo.yaml` from episode 5). Show the top-level `recipients:` map with named aliases (`partner`, `tax_authority`).
2. Walk through the percentage endpoint — 20% to `partner`, balance to the operator. Splits live **inside** `metering:`.
3. Walk through the mixed endpoint — a fixed `amount:` to `tax_authority` plus a `percent:` to `partner`. Recipients resolve at runtime from `${ENV_VAR}`.
4. Show a missing `${ENV_VAR}` failing at spec load — splits validate before the gateway binds.

> **Schema note:** declare every recipient once in the top-level `recipients:` map; reference them from `metering.splits[]`; use exactly one of `amount` or `percent` per split. See `splits.yml`.

### Tips & tricks
- Splits run **inside the same on-chain transaction** as the upstream charge. Either every recipient gets paid atomically or the call fails.
- A split missing a recipient (e.g. unset `${AFFILIATE_WALLET}`) fails fast at spec load — not at request time.
- `fee_payer: true` lets the operator sponsor the SOL fee so subscribers pay only the USDC amount.

### Best practice
> Name your recipients. `vendor` is documentation; a raw pubkey is a guessing game. Future you, your auditors, and your agent integrations will thank you.

### Takeaway
You can encode every recipient, percentage, and fee path of a real-world payment in a YAML block — no payment processor in the middle.

---

## Episode 9 — Debugging the 402 Handshake

**Duration:** 2:30
**Companion doc:** [/docs/accept-payments/debugging](https://pay.sh/docs/accept-payments/debugging)

### Hook
When a paid call breaks, you need to see exactly which step failed: the challenge, the proof, the verification, or the upstream forward. The Payment Debugger runs on the **gateway** — open it once, leave it open, and every request that lands shows up as a row you can click into.

### Bullets
- 🛰️ Flow timeline: every challenge / proof / commit / forward as a row, from the **provider's** point of view
- 🔬 Per-event inspector: headers, body, signature, timing
- 🎚️ Filter by path, error, or device
- 🔄 Live updates — flows stream in as the gateway sees them

### Hands-on steps
1. `pay --sandbox server start <spec.yml> --debugger` (or just `pay server demo`, which has it on by default).
2. Open `127.0.0.1:1402` — empty flow list.
3. Fire `pay --sandbox curl <endpoint>` from another terminal — a plain client call, no `--debugger` flag needed.
4. Watch the flow appear in real time. Click in — see the 402 challenge JSON, the payment-receipt header, the upstream response.
5. Force a failure: hit the endpoint without `pay`. See the 402-only flow, no payment row — exactly what an unauthenticated caller looks like.

### Tips & tricks
- **Two ways to run it.** Embedded on the gateway (`pay server start --debugger`) survives across requests and shows every flow from the provider's side — what you almost always want. Or as a **client proxy**: `pay --sandbox --debugger curl <url>` launches the proxy on `0.0.0.0:1402` and routes the call through it. For a one-shot `pay curl`, bind the gateway off `1402` (`--bind 127.0.0.1:1403`) so the proxy UI is reachable; it's most valuable on long-running sessions (`pay --debugger claude`).
- `--debugger` is **automatic** in sandbox mode for `pay server demo` and `pay server start`. You don't pass it explicitly there.
- `debugger.pay.sh` is the **hosted** version of everything we're showing here — same debugger UI, with a suite of sandbox-friendly paywalled endpoints already wired up. Useful when you want to see "what should this look like working" without running anything locally, or when CI / an agent can't bind to `127.0.0.1`.
- Filter to "this device" when sharing a sandbox with a teammate — keeps your traces out of theirs.
- The debugger captures the **upstream** response body too when `routing.type: proxy`. Useful for catching upstream auth misconfig (e.g. wrong API key).

### Best practice
> Run the debugger every time you change a spec. A spec that parses isn't the same as a spec that pays — the debugger catches the runtime gap.

### Takeaway
You can diagnose any broken paid call in seconds without reading server logs.

---

## Episode 10 — Managing Your pay Accounts

**Duration:** 3:30
**Companion doc:** [/docs/using-pay/manage-accounts](https://pay.sh/docs/using-pay/manage-accounts) · [CLI reference](https://pay.sh/docs/toolchain/commands/accounts)

### Hook
One wallet is fine until it isn't. You'll want a personal account for paying, an operator account for receiving, a way to move stablecoins between them — and a backup, because the OS keychain is convenient but it's not portable. Six commands cover the entire life cycle.

### Bullets (description copy)
- 📇 `pay whoami` / `pay account list` — see what you have, across networks
- ✨ `pay account new <name>` — spin up a second account, secret lands in the OS keystore
- 🎯 `pay account default <name>` and `--account <name>` — switch the default, or override for a single call
- 💸 `pay push <amount> <target>` — move USDC between accounts (or to any Solana address); pay-api covers SOL + ATA rent
- 📦 `pay account export <name>` — write the 64-byte Solana keypair to a JSON file
- ♻️ `pay account import <name> <file>` — restore on a new machine, keystore-backed again

### Hands-on steps
1. **What you've got.** `pay whoami` — shows the single mainnet account from Episode 1's `pay setup`. Then `pay account list` to widen the view: every network, every account, every non-zero stablecoin balance.
2. **Add a second account.** `pay account new work` — secret lands in Apple Keychain (or GNOME Secret Service / Windows Hello). Pubkey is cached in `~/.config/pay/accounts.yml`. Show the new row.
3. **Switch the default.** `pay account default work`. `pay whoami` now reports `work`. Subsequent payment commands sign with `work` until you switch again.
4. **One-off override + a real transfer.** `pay --account default push 10 work` — push 10 USDC from the original account into `work`. Show the receipt: amount, fee (≤ 0.0015 USDC), explorer link. No SOL ever leaves the sending account — pay-api co-signs.
5. **Back up before you fund.** `pay account export work` writes `pay-account-work-<pubkey>.json`. Move it to 1Password (or a hardware-encrypted USB). Then `shred -u ./pay-account-work-*.json` (macOS: `rm -P …`) to wipe the working copy.
6. **Simulate a new machine.** `pay account remove work --sandbox --yes` to clear the OS keystore entry locally (the network qualifier is required off mainnet). `pay --account work whoami` now refuses to sign. `pay account import work ./work-backup.json` re-seals the secret. The account is usable again instantly.

> **Flag ordering:** `--account` is a **global** flag — it precedes the subcommand (`pay --account work whoami`, not `pay whoami --account work`).

### Tips & tricks
- `pay push` and `pay send` are the same command — pick whichever reads better in your shell history.
- `pay push max work` drains the active account; the tool auto-implies `--fee-within` so the wallet ends at exactly zero balance.
- `pay push` is **fee-payer–backed**. You never need SOL in the sending account — only stablecoin. Recipient ATA rent is sponsored too.
- The OS keystore is the sensitive surface. `accounts.yml` alone is useless to an attacker. Don't bother encrypting that file; protect the keystore login instead.
- On macOS you can read the secret back out without `pay`: `security find-generic-password -s "pay.sh" -a "keypair:work" -w` — useful for emergency recovery if `pay account export` isn't available.

### Best practice
> **Export before you fund.** As soon as you create an account you intend to hold real value on, run `pay account export` and stash the file somewhere offline. The OS keystore doesn't iCloud-sync; if the machine dies and you have no export, the funds are gone.

### Takeaway
You can run multiple accounts on one machine, move stablecoins between them in one command, and recover any of them on a new machine — no `solana-cli`, no seed phrase, no hardware-wallet workflow required.

---

## Episode 11 — From Sandbox to Mainnet

**Duration:** 3:00
**Companion doc:** [/docs/toolchain/global-flags](https://pay.sh/docs/toolchain/global-flags) · [Sandbox & networks](https://pay.sh/docs/pay-for-apis/sandbox-and-networks) · [Deploy](https://pay.sh/docs/accept-payments/deploy)
**Code:** `code/episode-11-mainnet/provider.mainnet.yml`

### Hook
Sandbox proves the flow. Mainnet is where it makes money. The cutover is a flag flip plus real signers — and pay's defaults are designed to keep you safe through the transition.

### Bullets
- 🔁 `--sandbox` → `--mainnet` — same commands, different network
- 💼 `pay account list` / `pay account new` — manage signing wallets
- ⛽ `operator.signer:` — pin signing to a file keypair or GCP KMS
- 📡 `operator.rpc_url:` — point at your production RPC (Helius, Triton, etc.)
- 🛡️ `fee_payer: true` for gasless customers; `false` to let them cover their own

### Hands-on steps
1. `pay --mainnet whoami` — show the production wallet and balance.
2. `pay topup` — fund it via mobile wallet or onramp.
3. Edit a spec: set `operator.network: mainnet`, set `operator.signer: { type: file, path: /etc/pay/keypair.json }`, set `operator.rpc_url: <helius url>`.
4. `pay --mainnet server start spec.yml --bind 0.0.0.0:1402` — the gateway boots on mainnet, against your RPC, with your signer.
5. Smoke test: from another terminal, `pay --mainnet curl <endpoint>` — real charge settles.

### Tips & tricks
- **Never** put a signer keypair in the YAML. Pin it via path; rotate it through your secrets manager.
- Public IPs need a process manager (systemd, pm2). pay doesn't daemonize itself.
- Test the mainnet spec under sandbox first by swapping `network` and `rpc_url` only — every other line stays the same.

### Best practice
> Cap your operator wallet's balance. The gateway's job is to *receive*; it should never hold more than a few rolling weeks of revenue. Sweep to cold storage on a schedule.

### Takeaway
You can flip a working sandbox gateway to mainnet without changing a line of business logic.

---

## Episode 12 — Publishing to the pay-skills Catalog

**Duration:** 2:30
**Companion doc:** [/docs/accept-payments/publish-to-pay-skills](https://pay.sh/docs/accept-payments/publish-to-pay-skills) · [CLI reference](https://pay.sh/docs/toolchain/commands/agents)
**Code:** `code/episode-12-publish/`

### Hook
A gateway nobody can find is a gateway nobody pays. The pay-skills catalog is the open registry agents and humans search to discover paid APIs — and adding yours is a single PR.

### Bullets
- 📂 [solana-foundation/pay-skills](https://github.com/solana-foundation/pay-skills) — the open registry
- 📝 Metadata: title, description, category, gateway URL, endpoints, agent notes
- 🤖 Agent-readiness checklist — what makes an entry callable by Claude / Codex
- ✅ CI validates pricing, currency formats, and reachability before merge

### Hands-on steps
1. Browse the pay-skills repo (or [pay.sh/services](https://pay.sh/services)). Open an existing entry — note the metadata shape.
2. Generate registry metadata from your runtime spec: `pay skills provider sync providers/<...>.yml --operator <org> --out providers`.
3. Validate locally: `pay skills build . --output /tmp/pay-skills-dist`, then `pay skills probe . --files providers/<operator>/<name>.md --currencies USDC,USDT`, then `pay skills validate . --files providers/<operator>/<name>.md`.
4. Open the PR. CI runs the same checks plus a sandbox call against the gateway. Merge once green.
5. Back in the CLI: `pay skills update` then `pay skills search "<your-title>"` — your entry shows up.

> **Command note:** the validators are `pay skills build` / `probe` / `validate` and metadata is generated by `pay skills provider sync` — there is no `pay skills lint`.

### Tips & tricks
- Write the agent notes assuming the reader is an LLM with no other context. "Use this for X. Don't use this for Y. Costs ~$Z per call. Returns shape A." Concrete > clever.
- Include a working sample request in the entry. CI executes it; if it fails, your PR fails.
- Re-validate after every spec change — the catalog and your gateway must agree on price, endpoints, and currency.

### Best practice
> Treat the catalog entry like API documentation. Outdated metadata loses you agent traffic faster than downtime.

### Takeaway
You can make your gateway discoverable to every pay-enabled agent on the network with one merged PR.

---

## Production notes

### Visual style

- **Open every episode** with the same 1-second pay.sh wordmark animation. Mute background. Cuts to terminal immediately.
- **Terminal:** Ghostty or Alacritty at ~16pt Diatype Semi-Mono, near-black background `#080b0f`, white prompt, violet accent on `pay` commands. No other apps in frame.
- **Browser:** Always-on dark mode. Hide bookmarks bar. Use a clean profile.
- **Lower-thirds:** Mono font, white text on the violet accent strip when introducing a command (e.g. `pay --sandbox server demo`).
- **Chapter markers** in the YouTube description for each major step inside the episode.

### Recording setup

- **Audio:** Wired mic, no background music for the first 30 seconds (let the terminal speak). Sparse ambient bed after.
- **Pacing:** Aim for ~140 words per minute. Pause 0.5s between command and its output for legibility.
- **Cuts:** Single-take is ideal. If you need a second take, cut on the prompt to hide the seam.

### Outro / CTA

- 5-second outro card: "Try it: `brew install pay`" + docs URL + GitHub stars badge.
- Pinned comment on every video: the exact command(s) shown, copy-paste ready.

### Cadence

- **Pre-Tokyo sprint:** record every must-ship and as many preferred-tier episodes as we can edit in time. Don't release on a weekly cadence during the sprint — drop the playlist as a single batch the day before the conference opens so the URL is live when attendees arrive.
- **Post-conference:** resume a weekly drumbeat for the remaining episodes, every Tuesday 9 AM PT.
- Re-record episodes 1, 5, 10, and 11 every quarter — they're the highest-traffic landing pages and they all touch the install / keystore / mainnet surface, which changes most often.

## Distribution

| Channel              | Treatment                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| YouTube              | Primary host. Playlist link is the share asset. Add to channel sidebar.                                                                        |
| X / Twitter          | 30-second clip per episode, dropped Wednesday after Tuesday launch. The clip is the *failure-then-fix* moment (e.g. 402 → Touch ID → 200).      |
| Docs site            | Embed each episode at the top of its companion docs page. Episode 1 lives on `/docs/get-started`, episode 5 on `/docs/building-with-pay`, etc.  |
| GitHub README        | Pinned link to the playlist + episode 1 thumbnail in the README hero.                                                                          |
| Newsletter / blog    | A weekly recap post bundles the episode with the docs page link and any catalog news from that week.                                            |

## Success metrics

Track per episode, not per series:

- **Completion rate** (>50% target for 2-3min videos)
- **Clicks to docs** from the description's primary link
- **`pay --version` invocations** in the 48 hours after publish (proxy for install bumps; only measurable if pay phones home, which it currently doesn't — consider opt-in telemetry for the install command)
- **Catalog PRs opened** within 7 days of episode 12 — direct downstream signal
- **Sandbox gateway boots** within 7 days of episode 5 (measurable via Surfpool's sandbox RPC hit counts on the operator-fund cheatcode)

## What we explicitly don't cover in the 101 series

These deserve their own series (call it "pay 201") once the 101 lands:

- Self-hosting the gateway on Kubernetes / Vercel / Fly
- OpenAPI-driven gateways (`--openapi` flag) for upstreams with formal contracts
- Operator key rotation, hardware-wallet signers, and multi-sig operator wallets (episode 10 covers single-machine account management; rotation across compromise / hardware setups is a separate playbook)
- Session-channel payments for streaming APIs (`session:` block)
- Auditing and accounting integrations (receipts → ERP)
- Writing custom MCP skills that combine multiple paid APIs

Capture these in a backlog and revisit once the 101 has 4 weeks of analytics.
