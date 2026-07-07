# Episode 1 — Getting Started with pay

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
