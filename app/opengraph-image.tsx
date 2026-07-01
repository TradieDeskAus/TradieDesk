import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TradieDesk — Stop wasting hours on tradie paperwork";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom, #fff7ed, #ffffff)",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#ffedd5",
            color: "#c2410c",
            borderRadius: "999px",
            padding: "10px 24px",
            fontSize: "22px",
            fontWeight: 700,
            marginBottom: "32px",
          }}
        >
          🇦🇺 Built for Australian tradies
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 900,
            color: "#111827",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: "12px",
          }}
        >
          Stop wasting hours on
        </div>
        <div
          style={{
            fontSize: "72px",
            fontWeight: 900,
            color: "#f97316",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: "32px",
          }}
        >
          tradie paperwork
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: "28px",
            color: "#4b5563",
            textAlign: "center",
            maxWidth: "800px",
            marginBottom: "48px",
          }}
        >
          SWMS documents, quotes &amp; client emails in 30 seconds.
          Free to start. No card needed.
        </div>

        {/* CTA pill */}
        <div
          style={{
            display: "flex",
            background: "#f97316",
            color: "#ffffff",
            borderRadius: "16px",
            padding: "20px 48px",
            fontSize: "28px",
            fontWeight: 800,
          }}
        >
          tradiedeskapp.com.au
        </div>
      </div>
    ),
    { ...size }
  );
}
