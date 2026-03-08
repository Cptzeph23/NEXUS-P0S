import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/shared/auth-provider";
import { ToastNotification } from "@/components/shared/toast-notification";
import { PWAInstallPrompt } from "@/components/shared/pwa-install-prompt";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
        <ToastNotification />
        <PWAInstallPrompt />
      </body>
    </html>
  );
}