"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateDeviceId, saveTerminalConfig } from "@/lib/auth/helpers";
import { useAuthStore } from "@/stores/auth-store";

export default function BootPage() {
  const [branchCode, setBranchCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setTerminal, setBranch } = useAuthStore();

  async function handleRegister() {
    if (!branchCode.trim()) {
      setError("Please enter a branch code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const deviceId = await getOrCreateDeviceId();

      const response = await fetch("/api/auth/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, branchCode: branchCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Save terminal config
      await saveTerminalConfig(
        data.terminal.id,
        data.branch.id,
        data.branch.tenantId
      );

      setTerminal(data.terminal);
      setBranch(data.branch);

      // Navigate to login
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="flex items-center justify-center h-screen"
      style={{ backgroundColor: "#07070f", color: "#e8e0f8" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl"
        style={{
          backgroundColor: "#0d0d1a",
          border: "1px solid #2a2a3f",
        }}
      >
        <div className="text-center mb-8">
          <div
            className="text-4xl font-bold mb-2"
            style={{ color: "#7c3aed" }}
          >
            NEXUS
          </div>
          <div className="text-sm" style={{ color: "#6b6b8a" }}>
            Terminal Setup
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#c0b8d8" }}
            >
              Branch Code
            </label>
            <input
              type="text"
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value.toUpperCase())}
              placeholder="Enter branch code (e.g., DT01)"
              className="w-full px-4 py-3 rounded-lg text-lg tracking-wider font-mono"
              style={{
                backgroundColor: "#14141f",
                border: "1px solid #2a2a3f",
                color: "#e8e0f8",
              }}
              disabled={isLoading}
              autoFocus
            />
            <div className="mt-2 text-xs" style={{ color: "#6b6b8a" }}>
              Available codes: DT01, UT01, BK01
            </div>
          </div>

          {error && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                backgroundColor: "#1a0808",
                border: "1px solid #ef4444",
                color: "#fca5a5",
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-semibold transition-colors"
            style={{
              backgroundColor: isLoading ? "#5520b0" : "#7c3aed",
              color: "#ffffff",
            }}
          >
            {isLoading ? "Registering..." : "Register Terminal"}
          </button>
        </div>
      </div>
    </div>
  );
}