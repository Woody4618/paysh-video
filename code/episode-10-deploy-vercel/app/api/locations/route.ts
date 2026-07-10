import { NextResponse } from "next/server";
import { listLocations } from "../locations-data";

// Free discovery endpoint: lists the locations /forecast supports, so callers
// know what to ask for before paying. Listed in provider.yml WITHOUT `metering`,
// so the gateway forwards it with no paywall (like /health).
//
// It carries no sensitive data, so — like /health — it does not require the
// shared secret. Only the paid /forecast route is secret-gated.
//
// OpenAPI: LocationsResponse lives in app/api/schemas.ts.
export const dynamic = "force-dynamic";

/**
 * List the locations supported for weather forecast lookups
 * @response LocationsResponse
 * @openapi
 */
export function GET() {
  return NextResponse.json({
    locations: listLocations(),
    hint: "Call /forecast?location=<name> (paid) for a 7-day forecast.",
  });
}
