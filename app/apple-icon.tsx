import { ImageResponse } from "next/og";

// Home-screen icon for iPhones and iPads: the favicon's JY mark, larger.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1d5c48",
          color: "#f1efea",
          fontSize: 92,
          fontWeight: 900,
          letterSpacing: -4,
        }}
      >
        JY
      </div>
    ),
    size,
  );
}
