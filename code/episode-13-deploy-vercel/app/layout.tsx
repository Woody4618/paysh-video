import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Weather Pro — Paid Forecast API",
  description: "A Next.js app whose forecast API is paywalled by a pay gateway.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#080b0f",
          color: "#e8edf2",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      >
        {children}
      </body>
    </html>
  );
}
