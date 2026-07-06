# Episode 13 — Deploy a Paid Gateway (Vercel + Next.js)

**Duration:** 3:30
**Companion doc:** <https://pay.sh/docs/accept-payments/deploy>
**Vercel reference:** <https://vercel.com/blog/dockerfile-on-vercel>
**Deploy reference:** bundled `.agents/skills/pay/references/monetize-api.md` → "Production Deployment"
**Code:** `code/episode-13-deploy-vercel/`

> **Track:** producer. This is the "now put it on the internet" episode — it
> follows Episode 11 (sandbox → mainnet) and pairs with Episode 12 (publish).
> Everything shown runs on **mainnet**; keep real charges tiny ($0.01/call).

---

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "Every gateway so far has been running on localhost. That's great for
  building — but a gateway on `127.0.0.1` is a gateway nobody can pay. Today we
  put one on the public internet, right next to a normal Next.js app, on one
  Vercel project and one domain."
- 🖥️ Split screen for 1 second: `localhost:1402` on the left, `your-app.vercel.app`
  on the right. Cut to terminal.

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

### Scene 3 — The container (0:55–1:30)

- ⌨️ Open `Dockerfile.vercel`:

```docker
FROM ghcr.io/solana-foundation/pay:0.20.0
COPY provider.yml /app/provider.yml
CMD ["sh", "-c", "pay server start /app/provider.yml --bind 0.0.0.0:${PORT:-80}"]
```

- 🎙️ "The gateway is just a container that listens on a port. Vercel's only rule
  is: listen on `$PORT`. So I pin the official pay image, copy my spec in, and
  bind `$PORT`. That's the whole Dockerfile. This exact same image runs on Cloud
  Run, Fly, or a VM — Vercel isn't special here, it's just the host I'm picking."
- 🖥️ Lower-third: `the only rule: bind $PORT`

### Scene 4 — One domain with Next.js (1:30–2:00)

- ⌨️ Open `next.config.js`, highlight the rewrite:

```js
async rewrites() {
  return [{ source: '/pay/:path*', destination: '/pay/:path*' }];
}
```

- 🎙️ "Because the container lives in the same Vercel project as my Next.js app, I
  can serve both off one domain. My site is at the root; anything under `/pay`
  goes to the gateway. One push, one deploy, one URL."

### Scene 5 — Deploy + inject secrets (2:00–2:40)

- ⌨️ You run:

```sh
vercel deploy
```

- 🎙️ "Vercel builds the image, stores it, and autoscales it on Fluid compute.
  The secrets — the shared gateway secret, my RPC URL, my recipient wallet, and
  my KMS signer — all go in as project environment variables. Nothing sensitive
  is baked into the image."
- 🖥️ Show the Vercel env-var screen briefly: `GATEWAY_SHARED_SECRET`,
  `UPSTREAM_ORIGIN`, `PAY_RPC_URL`, `PAY_PAYMENT_RECIPIENT`, `PAY_GCP_KMS_KEY_NAME`,
  `PAY_GCP_KMS_PUBKEY`.
- 🎙️ "One thing that matters here: Vercel containers are stateless and
  autoscaled. So the signing key can't live *in* the container — it lives in KMS,
  and the container just asks KMS to sign. That's the `gcp-kms` backend in the
  spec."
- 🖥️ Lower-third: `stateless container → signer lives in KMS, not the image`

### Scene 6 — Verify the 402 (2:40–3:20)

- ⌨️ You run:

```sh
# Unpaid → clean 402 with the challenge intact
curl -i https://your-app.vercel.app/pay/forecast

# Direct API hit → 403 (paywall can't be bypassed)
curl -i https://your-app.vercel.app/api/forecast

# Paid → reaches the API route, returns 200
pay --mainnet curl https://your-app.vercel.app/pay/forecast
```

- 🎙️ "The one thing I always check on a new host: does the 402 survive the edge?
  A naked curl has to come back as a clean 402 with the challenge headers intact.
  A direct hit to `/api/forecast` should be a 403. Then a `pay` call pays a cent,
  the gateway injects the secret, forwards to my own `/api/forecast` route, and I
  get the forecast back with a 200. If the status or headers got mangled, that's
  edge middleware — pull it off the `/pay` path."
- 🖥️ On the paid call, the Touch ID prompt appears → approve → forecast JSON lands.

### Scene 7 — Takeaway (3:20–3:30)

- 🎙️ "So that's a real paid API on the public internet, sharing a domain with a
  Next.js app, settling USDC on mainnet — and the exact same container would run
  anywhere else that hosts a Dockerfile. Next episode, we make it discoverable in
  the catalog."

### Description bullets

- 🐳 `Dockerfile.vercel` — run `pay server start` on `$PORT`, autoscaled on Fluid compute
- 🔀 `routing.type: proxy` — paywall in front of the app's own `/api/forecast` route
- 🌐 One Vercel project, one domain — gateway under `/pay/*`, Next.js at the root
- 🔐 Stateless container → signer in KMS, secrets as env vars (never in the image)
- ✅ Verify the `402` + challenge headers survive the edge before you ship

### Accuracy notes

- **Two auth layers are the core concept.** Caller ↔ gateway is paid with crypto
  (no key). Gateway ↔ API is a shared secret (`x-gateway-secret`), injected
  *after* payment via `routing.auth.value_from_env` and validated by the route.
  Unpaid requests 402 and never reach the API; direct `/api/forecast` hits 403.
- **`endpoints[]` is also an allowlist** — unlisted method+path returns 404.
- **Host-agnostic.** `pay server start --bind 0.0.0.0:$PORT` is the universal
  form; Cloud Run/Fly/Railway/VM differ only in secret injection and process
  supervision (pay does not daemonize itself). Off Vercel, the app and gateway
  are usually two deployments joined by `UPSTREAM_ORIGIN`.
- **Vercel containers are stateless + autoscaled:** keep the signer in an external
  KMS, expect cold starts on scale-to-zero, and don't rely on the embedded
  debugger (in-memory, per-instance). Use `--otlp-sidecar` for prod observability.
- **Verify 402 passthrough first** — the highest-risk item on any managed edge.
- App builds clean on Next.js 15 (`npm run build`). Commands verified against
  `pay 0.20.0` and the "Production Deployment" section of `monetize-api.md`.
  Forecast data is deterministic demo output — swap the route body for a real
  data source.

---

## Companion doc bullets (YouTube description)

> A localhost gateway is a gateway nobody can pay. In this episode we take a
> Next.js app with a real API route, put a paid `pay` gateway in front of it, and
> deploy both to the public internet on Vercel — one domain — then verify the 402
> flow end to end on mainnet.

Links
Documentation: https://pay.sh/docs/accept-payments/deploy
Vercel containers: https://vercel.com/blog/dockerfile-on-vercel
Source: https://github.com/solana-foundation/pay
Catalog: https://github.com/solana-foundation/pay-skills
