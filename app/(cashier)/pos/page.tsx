"use client";

import { useAuthStore } from "@/stores/auth-store";

export default function POSPage() {
  const { cashier, branch } = useAuthStore();

  return (
    <div
      className="flex items-center justify-center h-screen flex-col gap-4"
      style={{ backgroundColor: "#07070f", color: "#e8e0f8" }}
    >
      <div className="text-5xl font-bold" style={{ color: "#7c3aed" }}>
        NEXUS
      </div>
      <div className="text-2xl font-bold tracking-tight">Point of Sale</div>

      {cashier && (
        <div className="mt-8 flex flex-col gap-2 items-center">
          <div className="text-sm" style={{ color: "#6b6b8a" }}>
            Logged in as
          </div>
          <div
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: "#0d0d1a",
              border: "1px solid #2a2a3f",
            }}
          >
            <div
              className="font-semibold text-lg"
              style={{ color: "#a78bfa" }}
            >
              {cashier.name}
            </div>
            <div className="text-xs" style={{ color: "#6b6b8a" }}>
              {cashier.role.toUpperCase()} • {branch?.name || "Unknown Branch"}
            </div>
          </div>
        </div>
      )}

      <div className="text-xs mt-8" style={{ color: "#3a3a55" }}>
        Phase 4 Complete - Authentication Working
      </div>
      <div className="text-xs" style={{ color: "#3a3a55" }}>
        Next: Phase 5 - POS Cashier Interface
      </div>
    </div>
  );
}