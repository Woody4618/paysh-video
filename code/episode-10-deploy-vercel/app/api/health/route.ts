import { NextResponse } from "next/server";

// Free health check. Listed in provider.yml with no `metering`, so the gateway
// forwards it without a paywall. Useful for uptime checks and the catalog probe.
//
// OpenAPI: the schema referenced below lives in app/api/schemas.ts (route.ts
// files may only export handlers + config). `openapi-gen` resolves it by name.
export const dynamic = "force-dynamic";

/**
 * Check service health and availability status
 * @response HealthResponse
 * @openapi
 */
export function GET() {
  return NextResponse.json({ status: "ok" });
}
