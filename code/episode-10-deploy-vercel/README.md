# Episode 10 — Deploy a Paid Gateway (Vercel + Next.js)

A single Next.js app that contains **both** a real API and its frontend, with a
**pay gateway** sitting in front of the API as a 402 paywall — all on one Vercel
project, one domain, using Vercel's
[Run any Dockerfile](https://vercel.com/blog/dockerfile-on-vercel) container
support.

## Architecture

```
  Browser ─► Next.js page  (/)                         app/page.tsx
                │  "Get forecast"
                ▼
           /pay/forecast   ─► pay gateway (402 paywall)   Dockerfile.vercel + provider.yml
                                    │  after payment, + shared-secret header
                                    ▼
                              /api/forecast              app/api/forecast/route.ts  ← the real API
```

Everything lives in one repo and ships as one `vercel deploy`.

## Files

| File                          | Purpose                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| `app/page.tsx`                | Frontend. Calls `/pay/forecast`; shows the 402 or the result.      |
| `app/api/forecast/route.ts`   | **The real API.** Returns forecast JSON. Gateway-only (see below). |
| `app/api/health/route.ts`     | Free health check (no metering).                                   |
| `provider.yml`                | Gateway spec. `routing.type: proxy` → the app's own `/api/`.        |
| `Dockerfile.vercel`           | Runs `pay server start` on `$PORT` as a Vercel container.          |
| `next.config.js`              | Rewrites `/pay/*` → the gateway container.                         |
| `.env.example`                | The env vars to set locally / in Vercel.                           |

---

## What "wrapping an API" actually means

The pay gateway sits **in front of** an API as a reverse proxy. There are two
completely separate authentication layers, and they never touch:

```
   Caller / Agent                Pay Gateway                 The API
  (has a wallet)              (pay server start)        (/api/forecast route)
        │                            │                          │
        │  1. GET /pay/forecast      │                          │
        ├───────────────────────────►│                          │
        │  2. 402 Payment Required   │  (API not called yet)    │
        │◄───────────────────────────┤                          │
        │  3. retry WITH payment     │                          │
        ├───────────────────────────►│ 4. verify payment on Solana
        │                            │ 5. add x-gateway-secret   │
        │                            │    and forward            │
        │                            ├─────────────────────────►│
        │                            │ 6. 200 + forecast JSON    │
        │  7. 200 + forecast         │◄─────────────────────────┤
        │◄───────────────────────────┤                          │
```

- **Layer 1 — caller ↔ gateway: paid with crypto, no API key.** The caller
  proves an on-chain USDC payment. Their only credential is a wallet + Touch ID.
- **Layer 2 — gateway ↔ API: a shared secret, no crypto.** The gateway injects
  an `x-gateway-secret` header **only after** payment verifies. The API route
  checks it and rejects anything without it — so nobody can bypass the paywall
  by hitting `/api/forecast` directly.

That second layer is the `auth` block in `provider.yml`:

```yaml
routing:
  type: proxy
  url: '${UPSTREAM_ORIGIN}/api/'
  auth:
    method: header
    key: x-gateway-secret
    value_from_env: GATEWAY_SHARED_SECRET   # gateway holds it; caller never sees it
```

…and the check in `app/api/forecast/route.ts`:

```ts
if (req.headers.get("x-gateway-secret") !== process.env.GATEWAY_SHARED_SECRET) {
  return unauthorized(); // 403
}
```

Net effect: the gateway is the thing that **only allows paid requests through** —
exactly as you'd expect. Unpaid requests get a `402` and never reach your API
(so they can't run up your compute or upstream costs).

> `endpoints[]` in `provider.yml` is also an **allowlist**: a method+path not
> listed there returns `404`, even if the route exists.

> If you use `routing.type: respond` instead of `proxy`, there's no separate API
> at all — the gateway itself returns the response. That's the demo mode from
> Episodes 5–6. `proxy` is what you use to put a paywall in front of a **real**
> API, like the `/api/forecast` route here.

---

## Run it locally

You run three things: the Next.js app, the gateway, and a paying client.

```sh
# 0) one-time: set env
cp .env.example .env.local
# generate a shared secret and paste it into BOTH GATEWAY_SHARED_SECRET below
openssl rand -hex 32

# 1) the Next.js app (frontend + /api/forecast) on :3000
npm install
npm run dev

# 2) the gateway in sandbox mode, proxying to the app, on :1402
#    UPSTREAM_ORIGIN points the gateway back at the Next.js app.
GATEWAY_SHARED_SECRET=<same-secret> UPSTREAM_ORIGIN=http://localhost:3000 \
  pay --sandbox server start provider.yml --bind 127.0.0.1:1402

# 3) pay for a forecast (sandbox = no real funds)
pay --sandbox curl "http://127.0.0.1:1402/forecast?location=Tokyo"
```

- A naked `curl http://127.0.0.1:1402/forecast` returns **402**.
- Hitting the API directly, `curl http://localhost:3000/api/forecast`, returns
  **403** (no shared secret) — proving the paywall can't be bypassed.
- `pay --sandbox curl …/forecast` returns **200** with the JSON.

---

## Deploying WITHOUT Vercel

Nothing about the paywall is Vercel-specific. The gateway is just a container
that listens on a port. Anywhere that runs a long-lived container works:

```sh
# The universal form — runs on Cloud Run, Fly, Railway, Render, ECS, K8s, or a
# plain VM under systemd/pm2.
pay server start /app/provider.yml --bind 0.0.0.0:8080
```

- **Google Cloud Run** (the repo's reference target): one service per spec,
  `--bind 0.0.0.0:8080`, secrets from Secret Manager, signer from Cloud KMS. See
  `.agents/skills/pay/references/monetize-api.md` → "Production Deployment".
- **Fly.io / Railway / Render:** same container, set the internal port to match
  `--bind`, inject secrets as env vars.
- **A VM:** pay does **not** daemonize — front it with systemd/pm2 to restart on
  crash, and put nginx/Caddy in front for TLS + a custom domain.

In a non-Vercel setup the Next.js app and the gateway are usually **two
deployments**: host the app anywhere (Vercel, a Node server, a container), host
the gateway on a container platform, and point `UPSTREAM_ORIGIN` at the app's
public origin. The `auth` layer is identical everywhere — it's a property of the
spec, not the host. The resulting public HTTPS domain becomes the `service_url`
in your pay-skills listing (Episode 11).

---

## The Vercel-specific bits

Vercel's [Run any Dockerfile](https://vercel.com/blog/dockerfile-on-vercel)
makes the gateway container a first-class citizen beside the Next.js app: one
push, one domain, autoscaled on Fluid compute.

Two things to get right because Vercel containers are **stateless & autoscaled**:

1. **Never bake the key into the image.** The keypair arrives at runtime via the
   `PAY_SIGNER_KEYPAIR` env var and is written to `/tmp` at boot. This is a
   **hot-wallet** setup — the raw key is readable by anyone with Vercel dashboard
   access, and is written to each ephemeral instance. Keep only a few dollars on
   it and sweep revenue to a cold account with `pay push`.
2. **The embedded debugger won't persist.** It's in-memory per instance and
   evaporates on scale-down. Use OTLP export (`--otlp-sidecar`) for production
   observability instead.

> **Why not GCP KMS here?** The `gcp-kms` signer is the secure production
> choice, but it's a **build-feature-gated** code path in pay
> (`cargo build --features gcp_kms`). The stock
> `ghcr.io/solana-foundation/pay:latest` image is **not** built with it, so
> setting `backend: gcp-kms` will make the gateway error at startup. To use KMS
> you must either (a) build a custom pay image with the feature enabled, or
> (b) run the gateway on **Google Cloud Run**, where the container gets native
> GCP auth (Workload Identity) and KMS works with far less glue. On Vercel, the
> hardened file/hot-wallet approach above is the pragmatic path.

Expect a **cold start** on the first request after idle (scale-to-zero); set a
minimum instance count if that first-call latency matters.

### Deploy

```sh
vercel deploy
```

Set these as Vercel project environment variables (never commit them):

| Env var                 | What it is                                                       |
| ----------------------- | ---------------------------------------------------------------- |
| `GATEWAY_SHARED_SECRET` | Secret the gateway injects and `/api/forecast` validates.        |
| `UPSTREAM_ORIGIN`       | The app's own public origin, e.g. `https://your-app.vercel.app`. |
| `GATEWAY_URL`           | Internal URL of the gateway container (for the `/pay/*` rewrite).|
| `PAY_RPC_URL`           | Your production Solana RPC (Helius, Triton, …).                   |
| `PAY_PAYMENT_RECIPIENT` | Wallet that receives the USDC.                                   |
| `PAY_GCP_KMS_KEY_NAME`  | KMS key resource name for the signer.                            |
| `PAY_GCP_KMS_PUBKEY`    | Public key of the KMS signer.                                    |

### Verify the 402 passthrough (do this first)

The single highest-risk item is Vercel's edge mangling the `402` status or the
challenge/receipt headers. Confirm it end-to-end:

```sh
# Unpaid: must be a clean 402 with the challenge headers intact.
curl -i https://your-app.vercel.app/pay/forecast

# Direct API hit: must be 403 (paywall can't be bypassed).
curl -i https://your-app.vercel.app/api/forecast

# Paid: must reach the API and return 200.
pay --mainnet curl https://your-app.vercel.app/pay/forecast
```

If the status or headers come back altered, remove any edge middleware on
`/pay/*`, or move the gateway to its own subdomain instead of a path rewrite.

## Docs

- Run any Dockerfile on Vercel: https://vercel.com/blog/dockerfile-on-vercel
- Vercel container images: https://vercel.com/docs/functions/container-images
- pay deploy reference: `.agents/skills/pay/references/monetize-api.md`
- Deploy docs: https://pay.sh/docs/accept-payments/deploy
