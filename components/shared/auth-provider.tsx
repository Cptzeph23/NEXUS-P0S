"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  getOrCreateDeviceId,
  getStoredTerminalId,
  getStoredBranchId,
  getStoredSessionId,
  saveTerminalConfig,
} from "@/lib/auth/helpers";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { setInitialized, setTerminal, setBranch } = useAuthStore();

  useEffect(() => {
    async function initializeAuth() {
      try {
        // Get or create device ID
        const deviceId = await getOrCreateDeviceId();

        // Check if terminal is registered
        const terminalId = await getStoredTerminalId();
        const branchId = await getStoredBranchId();

        if (!terminalId || !branchId) {
          // Need to register terminal
          router.push("/boot");
          return;
        }

        // Terminal registered, check session
        const sessionId = await getStoredSessionId();

        if (!sessionId) {
          // Need to log in
          router.push("/login");
          return;
        }

        // TODO: Validate session with server
        // For now, assume valid

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