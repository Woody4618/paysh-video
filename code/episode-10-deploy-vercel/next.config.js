// Route paid paths to the pay gateway container while the rest of the site is
// served by Next.js.
//
// IMPORTANT: the app and the gateway are TWO SEPARATE Vercel projects on TWO
// domains — Vercel can't run a Next.js app and a Dockerfile container in the
// same project/domain. This rewrite is what lets callers use the APP domain as
// a single front door: `/pay/*` on the app is transparently proxied to the
// gateway's own domain (GATEWAY_URL). The gateway domain also stays directly
// reachable — both paths hit the same container.
//
// Architecture:
//   Browser ─► Next.js page (/)                        ← app project (domain A)
//   app/pay/* ──(rewrite)──► gateway container /*       ← gateway project (domain B)
//                └─after payment─► app /api/forecast    ← app project (domain A)
//
// The gateway proxies to the app's /api/forecast (see provider.yml routing.url,
// fed by UPSTREAM_ORIGIN = the app's domain) and injects a shared secret so the
// route rejects unpaid direct hits.
//
// IMPORTANT: the 402 flow depends on the response STATUS (402) and custom
// challenge/receipt headers surviving untouched. Do NOT run edge middleware
// that rewrites status codes or strips headers on the /pay/* path. Verify
// end-to-end after deploy (see README "Verify the 402 passthrough").

// Normalize GATEWAY_URL: strip whitespace/newlines (common copy-paste artifact
// in dashboard env vars) and prepend https:// if the scheme is missing. Next.js
// rewrite destinations must start with `/`, `http://`, or `https://`, so a bare
// hostname or a stray newline otherwise fails the build.
function gatewayBaseUrl() {
  const raw = (process.env.GATEWAY_URL || "").trim();
  if (!raw) return "http://localhost:1402"; // local dev default
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, "");
  return `https://${raw.replace(/\/+$/, "")}`;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const gateway = gatewayBaseUrl();
    return [
      {
        source: "/pay/:path*",
        // Points at the gateway container. Swap GATEWAY_URL for your gateway's
        // URL per Vercel's container-images routing docs:
        // https://vercel.com/docs/functions/container-images
        destination: `${gateway}/:path*`,
      },
      {
        // The gateway's in-browser payment UI ("Pay in browser") posts to
        // /__402/rpc to run the 402 handshake, and reads its discovery surfaces
        // at /.well-known/pay-skills.json and /openapi.json. These live on the
        // GATEWAY, not on Next.js. Without this rewrite, `next dev` answers them
        // with its 404 HTML page and the browser UI throws
        //   "Unexpected token '<', "<!DOCTYPE "... is not valid JSON".
        // On Vercel the whole domain routes to the container so this is implicit;
        // locally (next dev on :3000 + gateway on :1402) we forward it explicitly.
        source: "/__402/:path*",
        destination: `${gateway}/__402/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
