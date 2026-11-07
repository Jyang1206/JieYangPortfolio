import { ImageResponse } from "next/og";

// The link preview image (LinkedIn, Telegram, Slack, X). Every page uses it unless it sets its own.
export const alt = "Jie Yang, Software Engineer: robotics, AI, backends and interfaces";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Anton, the heavy condensed face, fetched as TTF at build time (the image renderer cannot read woff2). */
async function loadAnton(): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=Anton")).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const anton = await loadAnton();
  const display = anton ? "Anton" : "sans-serif";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f1efea",
          padding: "64px 72px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* The hero's green arch, right side. */}
        <div
          style={{
            position: "absolute",
            right: 72,
            top: 64,
            bottom: 0,
            width: 420,
            background: "#1d5c48",
            borderTopLeftRadius: 210,
            borderTopRightRadius: 210,
            display: "flex",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: display, fontSize: 150, color: "#141414", lineHeight: 0.92 }}>HELLO! I&apos;M</div>
            <div style={{ fontFamily: display, fontSize: 150, color: "#1f4fff", lineHeight: 0.92 }}>JIE YANG</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontFamily: display, fontSize: 52, color: "#141414", letterSpacing: 1 }}>SOFTWARE ENGINEER</div>
            <div style={{ fontSize: 28, color: "#4a4642" }}>Robotics · AI · Backends · Interfaces</div>
            <div style={{ fontSize: 28, color: "#4a4642" }}>NUS Computer Science</div>
            <div style={{ fontSize: 24, color: "#1f4fff", marginTop: 8 }}>jieyang.vercel.app</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: anton ? [{ name: "Anton", data: anton, style: "normal", weight: 400 }] : [] },
  );
}
