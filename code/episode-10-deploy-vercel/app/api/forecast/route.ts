import { NextRequest, NextResponse } from "next/server.js";
import { buildForecast, listLocations, resolveLocation } from "../locations-data";

// This is the ACTUAL API — the thing callers are paying for.
//
// It is NOT publicly callable: the pay gateway is the only thing allowed to
// reach it. The gateway injects a shared secret header (configured in
// provider.yml as routing.auth), and this route rejects anything without it.
// That's what stops someone from skipping the paywall by hitting
// /api/forecast directly.

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { error: "Forbidden: requests must go through the paid gateway (/pay/...)." },
    { status: 403 },
  );
}

export async function GET(req: NextRequest) {
  const expected = process.env.GATEWAY_SHARED_SECRET;

  // In production the secret MUST be set. Fail closed if it isn't.
  if (!expected) {
    return NextResponse.json(
      { error: "Server misconfigured: GATEWAY_SHARED_SECRET is not set." },
      { status: 500 },
    );
  }

  if (req.headers.get("x-gateway-secret") !== expected) {
    return unauthorized();
  }

  // Default to San Francisco when no location is given (keeps the bare
  // /forecast demo working). An explicit but unknown location is a 404 so the
  // `location` parameter visibly matters — discover valid ones at /locations.
  const raw = req.nextUrl.searchParams.get("location");
  const key = resolveLocation(raw ?? "San Francisco");

  if (!key) {
    return NextResponse.json(
      {
        error: "unknown_location",
        message: `No forecast for "${raw}". See /locations for supported locations.`,
        available: listLocations().map((l) => l.name),
      },
      { status: 404 },
    );
  }

  return NextResponse.json(buildForecast(key));
}
