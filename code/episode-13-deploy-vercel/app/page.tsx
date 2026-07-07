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

export default function Home() {
  const [location, setLocation] = useState("San Francisco");
  const [status, setStatus] = useState<string>("");
  const [data, setData] = useState<Forecast | null>(null);

  async function getForecast() {
    setStatus("Requesting /pay/forecast …");
    setData(null);
    try {
      const res = await fetch(`/pay/forecast?location=${encodeURIComponent(location)}`);
      if (res.status === 402) {
        setStatus(
          "402 Payment Required — the paywall works. Call it through `pay` to complete payment.",
        );
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
