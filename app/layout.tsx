import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
