import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/shared/auth-provider";

export const metadata: Metadata = {
  title: "Nexus POS",
  description: "Offline-first multi-branch Point of Sale system",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}