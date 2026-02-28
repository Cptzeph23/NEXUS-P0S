"use client";

import type { IDBProduct } from "@/lib/db/schema";
import { fmt } from "@/lib/utils";

interface ProductCardProps {
  product: IDBProduct;
  inCart: boolean;
  onAdd: (product: IDBProduct) => void;
}

export function ProductCard({ product, inCart, onAdd }: ProductCardProps) {
  return (
    <button
      onClick={() => onAdd(product)}
      className="text-left p-3 rounded-lg transition-all relative"
      style={{
        backgroundColor: inCart ? "#1a0d30" : "#0f0f1c",
        border: `1px solid ${inCart ? "#7c3aed" : "#1e1e30"}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#7c3aed";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = inCart ? "#7c3aed" : "#1e1e30";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {inCart && (
        <div
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: "#7c3aed", color: "#fff" }}
        >
          ✓
        </div>
      )}

      <div className="text-sm font-semibold mb-1" style={{ color: "#c8c0e0" }}>
        {product.name}
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className="text-lg font-bold" style={{ color: "#a78bfa" }}>
          {fmt(product.price)}
        </span>
        <span
          className="text-xs"
          style={{ color: product.stock < 20 ? "#f87171" : "#6b7280" }}
        >
          ×{product.stock}
        </span>
      </div>
    </button>
  );
}