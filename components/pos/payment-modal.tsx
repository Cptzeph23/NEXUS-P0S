"use client";

import { useState } from "react";
import type { PaymentMethod } from "@/types";
import { fmt } from "@/lib/utils";

interface PaymentModalProps {
  total: number;
  onComplete: (payment: {
    method: PaymentMethod;
    amount: number;
    change?: number;
  }) => void;
  onClose: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = ["cash", "card", "mobile_pay"];

export function PaymentModal({ total, onComplete, onClose }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [cashInput, setCashInput] = useState("0");
  const [isProcessing, setIsProcessing] = useState(false);

  const cash = parseFloat(cashInput) || 0;
  const change = Math.max(0, cash - total);

  function handleDigit(digit: string) {
    setCashInput((prev) => (prev === "0" ? digit : prev + digit));
  }

  function handleBackspace() {
    setCashInput((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  }

  async function handlePay() {
    if (method === "cash" && cash < total) return;

    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 800));

    onComplete({
      method,
      amount: method === "cash" ? cash : total,
      change: method === "cash" ? change : undefined,
    });
  }

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "00", "."];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", zIndex: 100 }}
    >
      <div
        className="w-full max-w-lg p-8 rounded-2xl"
        style={{
          backgroundColor: "#0d0d1a",
          border: "1px solid #3b1f6e",
          boxShadow: "0 0 60px rgba(124,58,237,0.3)",
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: "#e8e0f8" }}>
            Payment
          </h2>
          <button
            onClick={onClose}
            className="text-2xl"
            style={{ color: "#6b6b8a" }}
          >
            ✕
          </button>
        </div>

        {/* Total */}
        <div
          className="text-center p-4 rounded-xl mb-6"
          style={{ backgroundColor: "#0a0a12" }}
        >
          <div className="text-xs mb-1" style={{ color: "#9f9fbe" }}>
            TOTAL DUE
          </div>
          <div
            className="text-4xl font-bold text-money"
            style={{ color: "#a78bfa" }}
          >
            {fmt(total)}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex gap-2 mb-6">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className="flex-1 py-3 rounded-lg text-sm font-bold capitalize transition-all"
              style={{
                border: `2px solid ${m === method ? "#7c3aed" : "#2a2a3f"}`,
                backgroundColor: m === method ? "#1f1040" : "#0d0d1a",
                color: m === method ? "#c4b5fd" : "#6b6b8a",
              }}
            >
              {m.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Cash Numpad */}
        {method === "cash" && (
          <div className="mb-6">
            <div
              className="text-right p-4 rounded-lg mb-3 text-3xl font-bold text-money"
              style={{
                backgroundColor: "#0a0a0f",
                border: "1px solid #2a2a3f",
                color: "#e8e0f0",
              }}
            >
              {fmt(cash)}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {digits.map((d) => (
                <button
                  key={d}
                  onClick={() => handleDigit(d)}
                  className="py-4 rounded-lg text-lg font-semibold transition-colors"
                  style={{
                    backgroundColor: "#14141f",
                    border: "1px solid #2a2a3f",
                    color: "#c8c0e0",
                  }}
                  onMouseDown={(e) =>
                    (e.currentTarget.style.backgroundColor = "#7c3aed")
                  }
                  onMouseUp={(e) =>
                    (e.currentTarget.style.backgroundColor = "#14141f")
                  }
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={handleBackspace}
                className="py-3 rounded-lg font-semibold"
                style={{
                  backgroundColor: "#1f1030",
                  border: "1px solid #4c1d95",
                  color: "#a78bfa",
                }}
              >
                ⌫ DEL
              </button>
              <button
                onClick={handlePay}
                disabled={cash < total}
                className="py-3 rounded-lg font-bold"
                style={{
                  backgroundColor: cash >= total ? "#7c3aed" : "#5520b0",
                  color: "#ffffff",
                }}
              >
                ✓ Charge
              </button>
            </div>

            {/* Change Display */}
            {cash >= total && (
              <div
                className="p-4 rounded-lg flex justify-between"
                style={{
                  backgroundColor: "#0d2010",
                  border: "1px solid #166534",
                }}
              >
                <span className="font-semibold" style={{ color: "#86efac" }}>
                  Change Due
                </span>
                <span
                  className="text-2xl font-bold text-money"
                  style={{ color: "#4ade80" }}
                >
                  {fmt(change)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Card/Mobile Payment */}
        {method !== "cash" && (
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all"
            style={{
              backgroundColor: isProcessing ? "#4c1d95" : "#7c3aed",
              color: "#ffffff",
            }}
          >
            {isProcessing ? "Processing..." : `Charge ${fmt(total)}`}
          </button>
        )}
      </div>
    </div>
  );
}