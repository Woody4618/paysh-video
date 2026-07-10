import { NextRequest, NextResponse } from "next/server";
import spec from "../../../public/openapi.json";

// Serves the OpenAPI document for the Weather Pro API.
//
// The document itself is GENERATED, not hand-written: `openapi-gen generate`
// (see openapi-gen.config.ts) scans the App Router handlers under app/api,
// reads their Zod schemas + JSDoc tags, and writes public/openapi.json. That
// runs automatically on build via the "prebuild" npm script, and on demand via
// `npm run openapi`.
//
// This route does the one thing generation can't do at build time: fill in the
// server URL from the request, so the advertised `servers[].url` matches how the
// caller actually reached us (localhost, the gateway domain, or a preview
// deploy). Prefer the forwarded host set by the gateway/proxy.
export const dynamic = "force-dynamic";

/**
 * @ignore
 */
export function GET(req: NextRequest) {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const host = forwardedHost ?? req.nextUrl.host;
  const proto = forwardedProto ?? req.nextUrl.protocol.replace(":", "");
  const baseUrl = `${proto}://${host}`;

  const doc = {
    ...spec,
    servers: [{ url: baseUrl, description: "This deployment" }],
  };

  return NextResponse.json(doc);
}
