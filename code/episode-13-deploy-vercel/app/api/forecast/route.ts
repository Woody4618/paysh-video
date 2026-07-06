import { NextRequest, NextResponse } from "next/server";

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

  const location = req.nextUrl.searchParams.get("location") ?? "San Francisco";

  // A real implementation would call a weather provider or read a DB here.
  // We return deterministic demo data so the episode is self-contained.
  const now = new Date();
  const daily = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now.getTime() + i * 86_400_000);
    return {
      date: day.toISOString().slice(0, 10),
      high_c: 18 + ((i * 3) % 7),
      low_c: 9 + ((i * 2) % 5),
      condition: ["clear", "partly cloudy", "rain", "cloudy"][i % 4],
    };
  });

  return NextResponse.json({
    location,
    generated_at: now.toISOString(),
    current: { temp_c: 17, condition: "partly cloudy", wind_kph: 12 },
    forecast: daily,
  });
}
