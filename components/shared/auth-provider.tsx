"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const { setInitialized, setTerminal, setBranch, logout } = useAuthStore();

  useEffect(() => {
    async function initializeAuth() {
      try {
        // Skip auth check for public routes
        if (pathname === "/boot" || pathname === "/login") {
          setIsLoading(false);
          return;
        }

        const deviceId = await getOrCreateDeviceId();
        const terminalId = await getStoredTerminalId();
        const branchId = await getStoredBranchId();
        const sessionId = await getStoredSessionId();

        console.log("Auth check:", { 
          deviceId: !!deviceId, 
          terminalId: !!terminalId, 
          branchId: !!branchId,
          sessionId: !!sessionId,
          pathname 
        });

        // No terminal registered
        if (!terminalId || !branchId) {
          console.log("No terminal, redirecting to boot");
          router.replace("/boot");
          setIsLoading(false);
          return;
        }

        // No session
        if (!sessionId) {
          console.log("No session, redirecting to login");
          router.replace("/login");
          setIsLoading(false);
          return;
        }

        // Load terminal and branch data
        try {
          const response = await fetch(`/api/terminal/${terminalId}`);
          if (response.ok) {
            const data = await response.json();
            setTerminal(data.terminal);
            setBranch(data.branch);
            console.log("Auth initialized:", { 
              terminal: data.terminal.name, 
              branch: data.branch.name 
            });
          } else {
            // Terminal not found, clear and re-register
            console.log("Terminal not found in database");
            logout();
            router.replace("/boot");
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.error("Failed to load terminal:", err);
          router.replace("/boot");
          setIsLoading(false);
          return;
        }

        setInitialized(true);
      } catch (error) {
        console.error("Auth initialization error:", error);
        logout();
        router.replace("/boot");
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();
  }, [pathname, router, setInitialized, setTerminal, setBranch, logout]);

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