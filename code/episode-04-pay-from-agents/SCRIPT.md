# Episode 4 — Pay from Claude, Codex, and the Claude Desktop App

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
