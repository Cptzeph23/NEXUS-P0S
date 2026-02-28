"use client";

import { useState } from "react";
import type { CartItem } from "@/types";
import { fmt } from "@/lib/utils";

interface CartLineProps {
  item: CartItem;
  onUpdateQty: (qty: number) => void;
  onUpdateDiscount: (discount: number) => void;
  onRemove: () => void;
}

export function CartLine({
  item,
  onUpdateQty,
  onUpdateDiscount,
  onRemove,
}: CartLineProps) {
  const [editing, setEditing] = useState<"qty" | "discount" | null>(null);
  const [editValue, setEditValue] = useState("");

  function startEdit(field: "qty" | "discount") {
    setEditing(field);
    setEditValue(field === "qty" ? String(item.qty) : String(item.discount));
  }

  function commitEdit() {
    if (editing === "qty") {
      onUpdateQty(parseInt(editValue) || 0);
    } else if (editing === "discount") {
      onUpdateDiscount(parseFloat(editValue) || 0);
    }
    setEditing(null);
  }

  return (
    <div
      className="grid gap-2 p-3 rounded-lg"
      style={{
        gridTemplateColumns: "2fr 60px 70px 1fr 28px",
        backgroundColor: "#0a0a14",
        border: "1px solid #1a1a28",
        alignItems: "center",
      }}
    >
      {/* Product Info */}
      <div>
        <div className="text-sm font-semibold" style={{ color: "#d0c8e8" }}>
          {item.name}
        </div>
        <div className="text-xs mt-1" style={{ color: "#6b6b8a" }}>
          {fmt(item.price)} each
        </div>
      </div>

      {/* Quantity */}
      {editing === "qty" ? (
        <input
          autoFocus
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => e.key === "Enter" && commitEdit()}
          className="w-full px-2 py-1 text-center text-sm rounded"
          style={{
            backgroundColor: "#1f1040",
            border: "1px solid #7c3aed",
            color: "#c4b5fd",
          }}
        />
      ) : (
        <div className="flex items-center gap-1 justify-center">
          <button
            onClick={() => onUpdateQty(item.qty - 1)}
            className="w-6 h-6 rounded text-sm"
            style={{
              backgroundColor: "#1a1a28",
              border: "1px solid #2a2a3f",
              color: "#9090b0",
            }}
          >
            −
          </button>
          <span
            onClick={() => startEdit("qty")}
            className="text-sm font-bold cursor-pointer min-w-[18px] text-center"
            style={{ color: "#e0d8f8" }}
          >
            {item.qty}
          </span>
          <button
            onClick={() => onUpdateQty(item.qty + 1)}
            className="w-6 h-6 rounded text-sm"
            style={{
              backgroundColor: "#1a1a28",
              border: "1px solid #2a2a3f",
              color: "#9090b0",
            }}
          >
            +
          </button>
        </div>
      )}

      {/* Discount */}
      {editing === "discount" ? (
        <input
          autoFocus
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => e.key === "Enter" && commitEdit()}
          className="w-full px-2 py-1 text-center text-xs rounded"
          style={{
            backgroundColor: "#1f1040",
            border: "1px solid #7c3aed",
            color: "#c4b5fd",
          }}
        />
      ) : (
        <button
          onClick={() => startEdit("discount")}
          className="px-2 py-1 rounded text-xs"
          style={{
            backgroundColor: item.discount > 0 ? "#1f1040" : "#0d0d1a",
            border: `1px solid ${item.discount > 0 ? "#7c3aed" : "#2a2a3f"}`,
            color: item.discount > 0 ? "#a78bfa" : "#4a4a6a",
          }}
        >
          {item.discount > 0 ? `-${item.discount}%` : "Disc"}
        </button>
      )}

      {/* Line Total */}
      <div className="text-sm font-bold text-right text-money" style={{ color: "#c4b5fd" }}>
        {fmt(item.lineTotal)}
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="text-base transition-colors"
        style={{ color: "#4a2a3a" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#4a2a3a")}
      >
        ✕
      </button>
    </div>
  );
}