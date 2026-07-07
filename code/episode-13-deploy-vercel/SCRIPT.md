# Episode 13 — Deploy a Paid Gateway (Vercel + Next.js)

**Duration:** ~4:30
**Companion doc:** <https://pay.sh/docs/accept-payments/deploy>
**Vercel reference:** <https://vercel.com/blog/dockerfile-on-vercel>
**Deploy reference:** bundled `.agents/skills/pay/references/monetize-api.md` → "Production Deployment"
**Code:** `code/episode-13-deploy-vercel/`
**Live demo:** <https://paysh-video.vercel.app>

> **Track:** producer. This is the "now put it on the internet" episode — it
> follows Episode 11 (sandbox → mainnet) and pairs with Episode 12 (publish).
> Everything shown runs on **mainnet**; keep real charges tiny ($0.01/call).

---

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "Every gateway so far has been running on localhost. That's great for
  building — but a gateway on `127.0.0.1` is a gateway nobody can pay. Today we
  put one on the public internet, right next to a normal Next.js app, on one
  Vercel project and one domain — and then we actually pay it, from the terminal
  and from the browser."
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

### Scene 4 — One domain with Next.js (1:35–2:05)

- ⌨️ Open `next.config.js`, highlight the rewrite:

```js
async rewrites() {
  return [
    { source: "/pay/:path*", destination: `${gatewayBaseUrl()}/:path*` },
  ];
}
```

- 🎙️ "My Next.js site is at the root; anything under `/pay` is rewritten to the
  gateway container. One domain, both halves. The `gatewayBaseUrl()` helper just
  trims stray whitespace and adds `https://` if it's missing — because a newline
  pasted into a dashboard env var will otherwise break the build. Small
  paper-cut, worth guarding."
- 🖥️ Lower-third: `site at / · gateway at /pay/*`

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
- 🌐 One Vercel project, one domain — gateway under `/pay/*`, Next.js at the root
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

## Companion doc bullets (YouTube description)

> A localhost gateway is a gateway nobody can pay. In this episode we take a
> Next.js app with a real API route, put a paid `pay` gateway in front of it, and
> deploy both to the public internet on Vercel — one domain — then pay it for real
> on mainnet: one command from the terminal with Touch ID, and the paywall shown
> live in the browser.

Links
Documentation: https://pay.sh/docs/accept-payments/deploy
Vercel containers: https://vercel.com/blog/dockerfile-on-vercel
Source: https://github.com/solana-foundation/pay
Catalog: https://github.com/solana-foundation/pay-skills
