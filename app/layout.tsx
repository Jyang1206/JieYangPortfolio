import type { Metadata } from "next";
import { Anton, Archivo, Martian_Mono, Nanum_Pen_Script, Schibsted_Grotesk, Yellowtail } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// The notebook's type system (docs/notebook-design.md).
// Display and labels: one variable family covers the black condensed word (wdth 62) and the bold corner labels.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
// Bold brush script for the oversized capital that overlaps each title (the reference poster's "C").
const script = Yellowtail({ subsets: ["latin"], weight: "400", variable: "--font-script", display: "swap" });
// Ballpoint handwriting for margin notes.
const hand = Nanum_Pen_Script({ subsets: ["latin"], weight: "400", variable: "--font-hand", display: "swap" });
// Body and UI.
const body = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted", display: "swap" });
// Measurements and readouts.
const mono = Martian_Mono({ subsets: ["latin"], axes: ["wdth"], variable: "--font-martian", display: "swap" });
// IRIS poster display face, used only inside the IRIS world.
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
// Tarii's own face (OFL), used only inside the Tarii world.
const hanken = localFont({
  src: "../public/fonts/hanken-grotesk/hanken-grotesk-variable.woff2",
  variable: "--font-hanken",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Jie Yang Robotics Portfolio",
  description:
    "An interactive robotics portfolio about human-centered automation, perception, and deployment work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${script.variable} ${hand.variable} ${body.variable} ${mono.variable} ${hanken.variable} ${anton.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
