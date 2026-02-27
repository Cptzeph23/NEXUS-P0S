"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredTerminalId, saveSession } from "@/lib/auth/helpers";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuthStore();

  function handlePinInput(digit: string) {
    if (pin.length < 4) {
      setPin(pin + digit);
    }
  }

  function handleBackspace() {
    setPin(pin.slice(0, -1));
  }

  function handleClear() {
    setPin("");
    setError("");
  }

  async function handleLogin() {
    if (pin.length !== 4) {
      setError("Please enter 4-digit PIN");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const terminalId = await getStoredTerminalId();

      if (!terminalId) {
        router.push("/boot");
        return;
      }

      const response = await fetch("/api/auth/cashier/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, terminalId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Save session
      await saveSession(
        data.session.sessionId,
        data.cashier.id,
        data.session.token
      );

      login(data.cashier, {
        sessionId: data.session.sessionId,
        cashier: {
          id: data.cashier.id,
          name: data.cashier.name,
          role: data.cashier.role,
        },
        terminalId,
        branchId: data.cashier.branchId,
        token: data.session.token,
        expiresAt: data.session.expiresAt,
        startedAt: data.session.startedAt,
      });

      router.push("/pos");
    } catch (err: any) {
      setError(err.message);
      setPin("");
    } finally {
      setIsLoading(false);
    }
  }

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  return (
    <div
      className="flex items-center justify-center h-screen"
      style={{ backgroundColor: "#07070f", color: "#e8e0f8" }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-2xl"
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
            Enter your PIN
          </div>
        </div>

        {/* PIN Display */}
        <div
          className="flex justify-center gap-3 mb-6 p-4 rounded-lg"
          style={{ backgroundColor: "#14141f" }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold"
              style={{
                backgroundColor: "#1e1e30",
                color: pin[i] ? "#7c3aed" : "#3a3a55",
              }}
            >
              {pin[i] ? "•" : ""}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-sm text-center"
            style={{
              backgroundColor: "#1a0808",
              border: "1px solid #ef4444",
              color: "#fca5a5",
            }}
          >
            {error}
          </div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {digits.map((digit) => (
            <button
              key={digit}
              onClick={() => handlePinInput(digit)}
              disabled={isLoading || pin.length >= 4}
              className="h-16 rounded-lg text-xl font-semibold transition-colors"
              style={{
                backgroundColor: "#14141f",
                border: "1px solid #2a2a3f",
                color: "#e8e0f8",
              }}
            >
              {digit}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleBackspace}
            disabled={isLoading || pin.length === 0}
            className="py-3 rounded-lg font-semibold"
            style={{
              backgroundColor: "#1e1e30",
              border: "1px solid #2a2a3f",
              color: "#c0b8d8",
            }}
          >
            ← Back
          </button>
          <button
            onClick={handleLogin}
            disabled={isLoading || pin.length !== 4}
            className="py-3 rounded-lg font-semibold"
            style={{
              backgroundColor:
                pin.length === 4 && !isLoading ? "#7c3aed" : "#5520b0",
              color: "#ffffff",
            }}
          >
            {isLoading ? "..." : "Login"}
          </button>
        </div>

        {/* Test PINs */}
        <div
          className="mt-6 p-3 rounded-lg text-xs text-center"
          style={{
            backgroundColor: "#14141f",
            border: "1px solid #2a2a3f",
            color: "#6b6b8a",
          }}
        >
          Test PINs: 0000 (Admin) | 1111 (John) | 2222 (Sarah)
        </div>
      </div>
    </div>
  );
}