# Episode 5 — Your First Paid Gateway

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
