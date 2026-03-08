"use client";

import { useEffect, useState } from "react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowPrompt(false);
  }

  function handleDismiss() {
    setShowPrompt(false);
    // Don't show again for 7 days
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  }

  // Check if dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDays) {
        setShowPrompt(false);
      }
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 p-4 rounded-xl shadow-2xl z-[150]"
      style={{
        backgroundColor: "#0d0d1a",
        border: "1px solid #7c3aed",
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl">📱</div>
        <div className="flex-1">
          <div className="font-bold text-sm mb-1" style={{ color: "#e0d8f8" }}>
            Install Nexus POS
          </div>
          <div className="text-xs" style={{ color: "#9f9fbe" }}>
            Install this app on your device for faster access and offline use
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDismiss}
          className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold"
          style={{
            backgroundColor: "#1a1a28",
            border: "1px solid #2a2a3f",
            color: "#9f9fbe",
          }}
        >
          Not Now
        </button>
        <button
          onClick={handleInstall}
          className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold"
          style={{
            backgroundColor: "#7c3aed",
            color: "#ffffff",
          }}
        >
          Install
        </button>
      </div>
    </div>
  );
}