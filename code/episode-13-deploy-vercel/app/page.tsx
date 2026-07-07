"use client";

import { useState } from "react";

// The frontend. It calls the PAID endpoint at /pay/forecast (rewritten to the
// gateway in next.config.js). The first hit returns 402; a pay-enabled client
// (or an agent with the Pay MCP) handles the payment and retries.
//
// A plain browser fetch below will surface the 402 as-is — that's expected, and
// it's the whole point: the browser sees the paywall. To actually get data,
// call it through `pay` (see the card on the right) or wire in a wallet.

type Forecast = {
  location: string;
  current: { temp_c: number; condition: string; wind_kph: number };
  forecast: { date: string; high_c: number; low_c: number; condition: string }[];
};

// What the 402 challenge is actually asking for, decoded from the response.
type Charge = {
  coin: string; // human symbol (USDC/USDT/CASH) or a shortened mint
  mint: string; // full token mint address
  amount: string; // on-chain amount in whole tokens (e.g. "0.01")
  usd?: number; // USD price from the response body, when present
  network?: string; // mainnet / devnet / localnet
  feePayer?: boolean; // true when the gateway sponsors the SOL fee
};

// Known Solana stablecoin mints → friendly symbols, so we can show "USDC"
// instead of a 44-char address. Anything else falls back to a shortened mint.
const MINT_SYMBOLS: Record<string, string> = {
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT",
  CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH: "CASH",
};

function shortMint(mint: string): string {
  return mint.length > 12 ? `${mint.slice(0, 4)}…${mint.slice(-4)}` : mint;
}

// base64url → JSON. The `request` field of the Www-Authenticate challenge is a
// base64url-encoded JSON object with the on-chain charge details.
function decodeBase64UrlJson(value: string): Record<string, unknown> | null {
  try {
    let b64 = value.replace(/-/g, "+").replace(/_/g, "/");
    b64 += "=".repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

// Pull the machine-readable charge out of a `Www-Authenticate: Payment …`
// header. The interesting bits (currency mint + amount) live only in the
// base64url `request="…"` field, not in the JSON body.
function parseChallenge(headerValue: string): Charge | null {
  const req = headerValue.match(/request="([^"]+)"/);
  if (!req) return null;
  const decoded = decodeBase64UrlJson(req[1]);
  if (!decoded) return null;

  const mint = String(decoded.currency ?? "");
  const md = (decoded.methodDetails ?? {}) as Record<string, unknown>;
  const decimals = Number(md.decimals ?? 6);
  const base = Number(decoded.amount ?? 0);
  const amount = (base / 10 ** decimals).toString();

  return {
    coin: MINT_SYMBOLS[mint] ?? shortMint(mint),
    mint,
    amount,
    network: md.network ? String(md.network) : undefined,
    feePayer: md.feePayer === true,
  };
}

export default function Home() {
  const [location, setLocation] = useState("San Francisco");
  const [status, setStatus] = useState<string>("");
  const [charge, setCharge] = useState<Charge | null>(null);
  const [data, setData] = useState<Forecast | null>(null);

  async function getForecast() {
    setStatus("Requesting /pay/forecast …");
    setData(null);
    setCharge(null);
    try {
      const res = await fetch(`/pay/forecast?location=${encodeURIComponent(location)}`);
      if (res.status === 402) {
        // Decode what the paywall wants: coin + amount from the challenge
        // header, USD price from the body.
        const parsed = parseChallenge(res.headers.get("www-authenticate") ?? "");
        let usd: number | undefined;
        try {
          const body = await res.json();
          usd = body?.pricing?.dimensions?.[0]?.price_usd;
        } catch {
          /* body is optional for the price display */
        }
        setCharge(parsed ? { ...parsed, usd } : null);
        setStatus("402 Payment Required — the paywall works. Complete it through `pay`.");
        return;
      }
      if (!res.ok) {
        setStatus(`Error ${res.status}: ${await res.text()}`);
        return;
      }
      setData(await res.json());
      setStatus("200 OK — payment verified, forecast delivered.");
    } catch (err) {
      setStatus(`Request failed: ${String(err)}`);
    }
  }

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Weather Pro</h1>
      <p style={{ color: "#9aa7b2", marginTop: 0 }}>
        A Next.js app whose forecast API is paywalled by a pay gateway. The site
        is served by Next.js; <code>/pay/*</code> is the paid gateway; the real
        API lives at <code>/api/forecast</code> and only the gateway can reach it.
      </p>

      <div style={{ display: "flex", gap: 24, marginTop: 32, flexWrap: "wrap" }}>
        <section style={{ flex: 1, minWidth: 300 }}>
          <h2 style={{ fontSize: 16, color: "#b79cff" }}>Try it from the browser</h2>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 12px",
                background: "#0f141a",
                border: "1px solid #263040",
                borderRadius: 8,
                color: "#e8edf2",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={getForecast}
              style={{
                padding: "10px 16px",
                background: "#ffffff",
                color: "#080b0f",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Get forecast
            </button>
          </div>
          {status && (
            <p style={{ marginTop: 16, color: "#9aa7b2", fontSize: 13 }}>{status}</p>
          )}
          {charge && (
            <div
              style={{
                marginTop: 12,
                padding: 16,
                background: "#0f141a",
                border: "1px solid #3a2e5c",
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: 12, color: "#b79cff", marginBottom: 10 }}>
                What the paywall is charging
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: "#e8edf2" }}>
                  {charge.amount}
                </span>
                <span style={{ fontSize: 16, color: "#b79cff", fontWeight: 600 }}>
                  {charge.coin}
                </span>
                {typeof charge.usd === "number" && (
                  <span style={{ fontSize: 13, color: "#9aa7b2" }}>
                    (≈ ${charge.usd.toFixed(2)})
                  </span>
                )}
              </div>
              <dl
                style={{
                  margin: "12px 0 0",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "4px 12px",
                  fontSize: 12,
                  color: "#9aa7b2",
                }}
              >
                <dt>Token mint</dt>
                <dd style={{ margin: 0, fontFamily: "monospace", wordBreak: "break-all" }}>
                  {charge.mint}
                </dd>
                {charge.network && (
                  <>
                    <dt>Network</dt>
                    <dd style={{ margin: 0 }}>{charge.network}</dd>
                  </>
                )}
                <dt>Network fee</dt>
                <dd style={{ margin: 0 }}>
                  {charge.feePayer
                    ? "sponsored by the gateway (you need no SOL)"
                    : "paid by your wallet"}
                </dd>
              </dl>
              <p style={{ margin: "12px 0 0", fontSize: 11, color: "#5f6b78" }}>
                Decoded from the <code>Www-Authenticate</code> challenge header — the
                browser can read it but can&apos;t sign, so it shows the price instead of
                paying.
              </p>
            </div>
          )}
          {data && (
            <pre
              style={{
                marginTop: 16,
                padding: 16,
                background: "#0f141a",
                border: "1px solid #263040",
                borderRadius: 8,
                overflowX: "auto",
                fontSize: 12,
              }}
            >
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </section>

        <section style={{ flex: 1, minWidth: 300 }}>
          <h2 style={{ fontSize: 16, color: "#b79cff" }}>Pay from the CLI</h2>
          <p style={{ color: "#9aa7b2", fontSize: 13 }}>
            The browser hits the paywall (402). To complete payment, call it
            through <code>pay</code>:
          </p>
          <pre
            style={{
              padding: 16,
              background: "#0f141a",
              border: "1px solid #263040",
              borderRadius: 8,
              overflowX: "auto",
              fontSize: 12,
            }}
          >
            {`# sandbox (no real funds)\npay --sandbox curl \\\n  http://localhost:3000/pay/forecast\n\n# mainnet (real $0.01)\npay --mainnet curl \\\n  https://paysh-video.vercel.app/pay/forecast`}
          </pre>
        </section>
      </div>
    </main>
  );
}
