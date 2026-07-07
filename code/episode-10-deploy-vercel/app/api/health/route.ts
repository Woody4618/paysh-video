import { NextResponse } from "next/server";

// Free health check. Listed in provider.yml with no `metering`, so the gateway
// forwards it without a paywall. Useful for uptime checks and the catalog probe.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok" });
}
