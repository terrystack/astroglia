import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASTROGLIA — Martian Base Telemetry",
  description: "Human telemetry and monitoring for Martian base operations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="scanline" />
        {children}
      </body>
    </html>
  );
}
