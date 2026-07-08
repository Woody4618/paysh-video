# Episode 10 — Deploy a Paid Gateway (Vercel + Next.js)

**Duration:** ~4:30
**Companion doc:** <https://pay.sh/docs/accept-payments/deploy>
**Vercel reference:** <https://vercel.com/blog/dockerfile-on-vercel>
**Deploy reference:** bundled `.agents/skills/pay/references/monetize-api.md` → "Production Deployment"
**Code:** `code/episode-10-deploy-vercel/`
**Live demo:** <https://paysh-video.vercel.app>

> **Track:** producer. This is the "now put it on the internet" episode — it
> pairs with Episode 11 (publish to the catalog).
> Everything shown runs on **mainnet**; keep real charges tiny ($0.01/call).

---

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "Lets build a public weather report API and deploy it. Every gateway so far has been running on localhost. That's great and easy for building — but a local host gateway nobody can pay. Today we put one on the public internet, right next to a normal Next.js app. On Vercel these are two separate projects — the Next.js app on one domain, the gateway container on another — but a single rewrite makes the app domain act as one front door. And then we actually pay it, from the terminal, let claude use it to get the current weather report, and debug it from the browser."

- 🖥️ Split screen for 1 second: `localhost:1402` on the left,
  `paysh-video.vercel.app` on the right. Cut to terminal.

### Scene 2 — The app and the API (0:20–0:55)

This is what we will build. Here i can request the weather report and i can also directly pay it in the browser. 

In the last videos we used method   routing type: respond now we will use proxy routing type: proxy and url: ${UPSTREAM_ORIGIN}/api/ Where upstream api will actually be our weather api here at paysh-video.vercel.app/ 

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

WORKDIR /app
COPY provider.yml /app/provider.yml

# Bind the privileged $PORT (Vercel uses 80); the base image's `pay` user can't.
USER root

# Base image sets ENTRYPOINT ["pay"]; --bind defaults to 0.0.0.0:$PORT.
CMD ["server", "start", "/app/provider.yml"]
```

- 🎙️ "The gateway is just a container that listens on a port. Vercel's only rule
  is: listen on `$PORT` — and pay's `--bind` already defaults to that. So there's
  no script here: copy the spec, run as root so it can bind port 80, done. The
  same image runs on Cloud Run, Fly, or a VM — Vercel isn't special, it's just the
  host I'm picking."
- ⌨️ Back in `provider.yml`, call out how config reaches pay — the honest part:

```yaml
operator:
  rpc_url: '${PAY_RPC_URL}'          # expanded from the environment
  recipient: '${PAY_PAYMENT_RECIPIENT}'
  signer:
    backend: env                      # keypair read straight from an env var
    value_from_env: PAY_OPERATOR_KEYPAIR
routing:
  url: '${UPSTREAM_ORIGIN}/api/'     # proxy target, also from the environment
```

- 🎙️ "pay expands `${VAR}` in the spec straight from the environment — the RPC,
  the recipient, and the proxy target all come from env vars. And the fee-payer
  keypair uses the `env` signer backend: pay reads it into memory from
  `PAY_OPERATOR_KEYPAIR` — never written to disk, never baked into the image.
  Nothing sensitive lives in the container; it's all injected at runtime."
- 🖥️ Lower-third: `the only rule: bind $PORT · config is all env vars`

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
  `PAY_PAYMENT_RECIPIENT`, `PAY_OPERATOR_KEYPAIR`.
- 🎙️ "For this demo the fee-payer wallet uses the `env` signer — the keypair comes
  in as `PAY_OPERATOR_KEYPAIR` and pay reads it straight into memory, never to
  disk. Treat it as a *hot wallet*: keep a few dollars on it, sweep the rest, and
  move to a KMS signer before it holds anything real. KMS needs a custom pay
  build, so it's not in the stock image — I'll cover that when we harden this."
- 🖥️ Lower-third: `hot wallet for the demo → KMS before real money`

### Scene 5b — Run the same container locally (optional B-roll)

- 🎙️ "Before I trust the deploy, I run the *exact same container* on my machine.
  Same image, same spec, same env vars — just pointed at my local Next.js instead
  of the production origin."
- ⌨️ Two terminals. First, the app; second, the gateway:

```sh
# terminal 1 — the Next.js app (frontend + /api/forecast)
npm run dev            # http://localhost:3000

# terminal 2 — build once, then run the gateway container
npm run gateway:build
npm run gateway        # http://localhost:1402
```

- 🎙️ "`npm run gateway` is just a wrapper around `docker run` with
  `--env-file .env.local`. The only twist for local: inside a container,
  `localhost` isn't the host — so `UPSTREAM_ORIGIN` points at
  `host.docker.internal:3000`. That's the one line the script overrides."
- ⌨️ Prove it, same as production:

```sh
curl http://localhost:1402/locations                 # free discovery
pay --mainnet curl "http://localhost:1402/forecast?location=Berlin"
```

- 🖥️ Lower-third: `same image locally · npm run gateway`
- 🎙️ "Why docker and not a bare `pay server start`? The `env` signer and `${VAR}`
  expansion ship in the container image; if your locally-installed `pay` is older
  it'll reject `backend: env`. Running the image sidesteps version drift — you're
  testing exactly what Vercel will run."

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
- 🔐 Secrets as env vars (never in the image); `env` signer for the demo, KMS for prod
- 💳 Live demo — pay the mainnet gateway from the terminal (Touch ID) and hit the paywall from the browser

### Accuracy notes

- **Two auth layers are the core concept.** Caller ↔ gateway is paid with crypto
  (no key). Gateway ↔ API is a shared secret (`x-gateway-secret`), injected
  *after* payment via `routing.auth.value_from_env` and validated by the route.
  Unpaid requests 402 and never reach the API; direct `/api/forecast` hits 403.
- **`endpoints[]` is also an allowlist** — unlisted method+path returns 404.
- **How config reaches pay (no entrypoint script):** pay expands `${VAR}` in the
  spec from the environment at load time — `PAY_RPC_URL` (`rpc_url`),
  `PAY_PAYMENT_RECIPIENT` (`recipient`), and `UPSTREAM_ORIGIN` (`routing.url`) are
  all env vars. `GATEWAY_SHARED_SECRET` is read via `value_from_env`. No CLI flags,
  no boot-time substitution, no `entrypoint.sh`.
- **Signer is `env`, not KMS, in this build.** The stock
  `ghcr.io/solana-foundation/pay:latest` image is not compiled with `gcp_kms`, so
  the demo uses the `env` signer backend (`value_from_env: PAY_OPERATOR_KEYPAIR`):
  pay reads the keypair into memory, never to disk. Still a hot wallet — migrate
  to KMS (custom build, or run on Cloud Run) before it holds real value.
- **`env` signer + `${VAR}` need the current image.** These landed in the
  `ghcr.io/solana-foundation/pay:latest` container; an older locally-installed
  `pay` may reject `backend: env`. For a byte-identical local run, run the image
  (`npm run gateway`) rather than a bare `pay server start`.
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
> deploy both to the public internet on Vercel — as two projects (app + gateway
> container) on two domains, joined by a `/pay/*` rewrite so callers get one
> front door — then pay it for real on mainnet: one command from the terminal
> with Touch ID, and the paywall shown live in the browser.

Links
Documentation: https://pay.sh/docs/accept-payments/deploy
Vercel containers: https://vercel.com/blog/dockerfile-on-vercel
Source: https://github.com/solana-foundation/pay
Catalog: https://github.com/solana-foundation/pay-skills
