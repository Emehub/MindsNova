import { ImageResponse } from "next/og";

export const alt = "MindsNova Hub: Empowering Minds. Shaping the Future.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social sharing image in the Minds Nova colours, with the Minds Nova mark. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #1b1a4b 0%, #4338ca 55%, #6d5cf0 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg width="88" height="88" viewBox="0 0 64 64">
            <defs>
              <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#4338ca" />
                <stop offset=".55" stopColor="#6d5cf0" />
                <stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="16" fill="url(#bg)" />
            <ellipse cx="32" cy="32" rx="24" ry="9" fill="none" stroke="#ffffff" strokeOpacity=".5" strokeWidth="2.2" transform="rotate(-28 32 32)" />
            <path d="M32 11c1.6 13.4 6.6 18.4 20 21-13.4 2.6-18.4 7.6-20 21-1.6-13.4-6.6-18.4-20-21 13.4-2.6 18.4-7.6 20-21z" fill="#ffffff" />
            <path d="M49 9.5c.5 3.6 1.9 5 5.5 5.5-3.6.5-5 1.9-5.5 5.5-.5-3.6-1.9-5-5.5-5.5 3.6-.5 5-1.9 5.5-5.5z" fill="#fcd34d" />
            <circle cx="10.6" cy="39.9" r="2.6" fill="#fcd34d" />
          </svg>
          <div style={{ fontSize: 46, fontWeight: 800 }}>MindsNova Hub</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>Empowering Minds.</div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, color: "#fcd34d" }}>Shaping the Future.</div>
          <div style={{ marginTop: 28, fontSize: 30, color: "rgba(255,255,255,0.85)" }}>
            Digital skills, mentorship and innovation for young people in Ghana and across Africa
          </div>
        </div>
      </div>
    ),
    size,
  );
}
