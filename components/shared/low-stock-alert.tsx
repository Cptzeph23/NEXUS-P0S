"use client";

import { useEffect, useState } from "react";
import { getLowStockItems } from "@/lib/db/stock";
import type { IDBStockLevel } from "@/lib/db/schema";

interface LowStockAlertProps {
  branchId: string;
}

export function LowStockAlert({ branchId }: LowStockAlertProps) {
  const [lowStock, setLowStock] = useState<IDBStockLevel[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function checkStock() {
      const items = await getLowStockItems(branchId);
      setLowStock(items);
    }

    checkStock();

    // Check every 5 minutes
    const interval = setInterval(checkStock, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [branchId]);

  if (lowStock.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 rounded-lg shadow-lg"
      style={{
        backgroundColor: "#1a0d0d",
        border: "1px solid #f59e0b",
        maxWidth: "320px",
        zIndex: 50,
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex justify-between items-center"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <span className="font-semibold" style={{ color: "#fbbf24" }}>
            {lowStock.length} Low Stock Items
          </span>
        </div>
        <span style={{ color: "#6b6b8a" }}>
          {isExpanded ? "▼" : "▶"}
        </span>
      </button>

      {isExpanded && (
        <div
          className="max-h-64 overflow-y-auto p-4 pt-0"
          style={{ borderTop: "1px solid #3a2020" }}
        >
          {lowStock.map((item) => (
            <div
              key={item.id}
              className="py-2"
              style={{ borderBottom: "1px solid #2a1a1a" }}
            >
              <div className="text-sm" style={{ color: "#fbbf24" }}>
                Product ID: {item.productId.slice(0, 8)}...
              </div>
              <div className="text-xs mt-1" style={{ color: "#9ca3af" }}>
                Stock: {item.quantity} / Reorder: {item.reorderPoint}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}