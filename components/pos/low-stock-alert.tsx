"use client";

import { useState, useEffect } from "react";
import { getLowStockProducts } from "@/lib/inventory/stock";

interface LowStockAlertProps {
  branchId: string;
}

export function LowStockAlert({ branchId }: LowStockAlertProps) {
  const [lowStock, setLowStock] = useState
    Array<{ productId: string; name: string; stock: number; reorderPoint: number }>
  >([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    async function checkStock() {
      const items = await getLowStockProducts(branchId);
      setLowStock(items);
      setShowAlert(items.length > 0);
    }

    checkStock();
    const interval = setInterval(checkStock, 60_000); // Check every minute
    return () => clearInterval(interval);
  }, [branchId]);

  if (!showAlert || lowStock.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 w-80 p-4 rounded-xl shadow-2xl z-50"
      style={{
        backgroundColor: "#1a0d0d",
        border: "1px solid #7f1d1d",
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <div>
            <div className="font-bold text-sm" style={{ color: "#fca5a5" }}>
              Low Stock Alert
            </div>
            <div className="text-xs" style={{ color: "#9f9fbe" }}>
              {lowStock.length} product{lowStock.length > 1 ? "s" : ""} running low
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAlert(false)}
          className="text-sm"
          style={{ color: "#6b6b8a" }}
        >
          ✕
        </button>
      </div>

      <div
        className="space-y-2 max-h-48 overflow-y-auto"
        style={{
          borderTop: "1px solid #2a1a1a",
          paddingTop: 8,
        }}
      >
        {lowStock.slice(0, 5).map((item) => (
          <div
            key={item.productId}
            className="flex justify-between text-xs p-2 rounded"
            style={{ backgroundColor: "#0d0707" }}
          >
            <span style={{ color: "#e0d8f8" }}>{item.name}</span>
            <span style={{ color: "#f87171" }}>
              {item.stock} / {item.reorderPoint}
            </span>
          </div>
        ))}
        {lowStock.length > 5 && (
          <div className="text-xs text-center" style={{ color: "#6b6b8a" }}>
            +{lowStock.length - 5} more...
          </div>
        )}
      </div>
    </div>
  );
}