// Route paid paths to the pay gateway container while the rest of the site is
// served by Next.js — one project, one domain.
//
// Architecture (all in this one app):
//   Browser ─► Next.js page (/)                     ← this app's frontend
//   /pay/* ──► pay gateway container (Dockerfile.vercel)  ← the paywall
//              └─after payment─► /api/forecast        ← this app's real API
//
// The gateway proxies to /api/forecast (see provider.yml routing.url) and
// injects a shared secret so the route rejects unpaid direct hits.
//
// IMPORTANT: the 402 flow depends on the response STATUS (402) and custom
// challenge/receipt headers surviving untouched. Do NOT run edge middleware
// that rewrites status codes or strips headers on the /pay/* path. Verify
// end-to-end after deploy (see README "Verify the 402 passthrough").

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/pay/:path*",
        // Points at the gateway container in the same Vercel project. Swap for
        // your gateway's internal/container URL per Vercel's container-images
        // routing docs: https://vercel.com/docs/functions/container-images
        // For local dev the gateway runs on its own port (see README).
        destination:
          process.env.GATEWAY_URL
            ? `${process.env.GATEWAY_URL}/:path*`
            : "http://localhost:1402/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
