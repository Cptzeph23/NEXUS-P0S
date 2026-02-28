"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  getOrCreateDeviceId,
  getStoredTerminalId,
  getStoredBranchId,
  getStoredSessionId,
} from "@/lib/auth/helpers";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { setInitialized, setTerminal, setBranch } = useAuthStore();

  useEffect(() => {
    async function initializeAuth() {
      try {
        const deviceId = await getOrCreateDeviceId();
        const terminalId = await getStoredTerminalId();
        const branchId = await getStoredBranchId();

        console.log("Auth init:", { deviceId, terminalId, branchId });

        if (!terminalId || !branchId) {
          console.log("No terminal registered, redirecting to boot");
          router.push("/boot");
          return;
        }

        // Fetch terminal and branch data from API
        try {
          const response = await fetch(`/api/terminal/${terminalId}`);
          if (response.ok) {
            const data = await response.json();
            setTerminal(data.terminal);
            setBranch(data.branch);
            console.log("Terminal and branch loaded:", data);
          }
        } catch (err) {
          console.error("Failed to load terminal data:", err);
        }

        const sessionId = await getStoredSessionId();

        if (!sessionId) {
          console.log("No session, redirecting to login");
          router.push("/login");
          return;
        }

        setInitialized(true);
      } catch (error) {
        console.error("Auth initialization error:", error);
        router.push("/boot");
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();
  }, [router, setInitialized, setTerminal, setBranch]);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ backgroundColor: "#07070f", color: "#6b6b8a" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#7c3aed", borderTopColor: "transparent" }}
          />
          <div>Initializing...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}