"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { db, type IDBProduct } from "@/lib/db/schema";
import { getStockLevel, adjustStock, getLowStockItems } from "@/lib/db/stock";
import type { IDBStockLevel } from "@/lib/db/schema";
import { fmt } from "@/lib/utils";

export default function InventoryPage() {
  const { branch, cashier } = useAuthStore();
  const [products, setProducts] = useState<IDBProduct[]>([]);
  const [stockLevels, setStockLevels] = useState<Map<string, IDBStockLevel>>(
    new Map()
  );
  const [lowStockItems, setLowStockItems] = useState<IDBStockLevel[]>([]);
  const [filter, setFilter] = useState<"all" | "low">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [adjustingProduct, setAdjustingProduct] = useState<string | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  useEffect(() => {
    if (!branch?.id) return;

    async function loadInventory() {
      try {
        // Load all products
        const allProducts = await db.products.toArray();
        setProducts(allProducts);

        // Load stock levels
        const levels = new Map<string, IDBStockLevel>();
        const stockData = await db.stock
          .where("branchId")
          .equals(branch!.id)
          .toArray();

        stockData.forEach((stock) => {
          levels.set(stock.productId, stock);
        });

        setStockLevels(levels);

        // Load low stock items
        const lowStock = await getLowStockItems(branch!.id);
        setLowStockItems(lowStock);
      } catch (error) {
        console.error("Failed to load inventory:", error);
      }
    }

    loadInventory();
  }, [branch?.id]);

  async function handleAdjustStock() {
    if (!adjustingProduct || !branch?.id) return;

    const qty = parseInt(adjustQuantity);
    if (isNaN(qty) || qty < 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (!adjustReason.trim()) {
      alert("Please enter a reason");
      return;
    }

    try {
      await adjustStock(branch.id, adjustingProduct, qty, adjustReason);

      // Refresh stock levels
      const updatedStock = await getStockLevel(branch.id, adjustingProduct);
      if (updatedStock) {
        setStockLevels(new Map(stockLevels.set(adjustingProduct, updatedStock)));
      }

      setAdjustingProduct(null);
      setAdjustQuantity("");
      setAdjustReason("");

      alert("Stock adjusted successfully");
    } catch (error) {
      console.error("Stock adjustment error:", error);
      alert("Failed to adjust stock");
    }
  }

  const filteredProducts = products
    .filter((p) => {
      if (filter === "low") {
        const stock = stockLevels.get(p.id);
        return stock && stock.quantity <= stock.reorderPoint;
      }
      return true;
    })
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: "#07070f" }}>
      {/* Header */}
      <div className="p-4" style={{ borderBottom: "1px solid #14141f" }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "#e0d8f8" }}>
          Inventory Management
        </h1>
        <div className="text-sm" style={{ color: "#6b6b8a" }}>
          {branch?.name || "Unknown Branch"}
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 flex gap-4" style={{ borderBottom: "1px solid #14141f" }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="flex-1 px-4 py-2 rounded-lg"
          style={{
            backgroundColor: "#0f0f1c",
            border: "1px solid #2a2a3f",
            color: "#c8c0e0",
          }}
        />

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{
              backgroundColor: filter === "all" ? "#1f1040" : "transparent",
              border: `1px solid ${filter === "all" ? "#7c3aed" : "#2a2a3f"}`,
              color: filter === "all" ? "#c4b5fd" : "#6b6b8a",
            }}
          >
            All Items
          </button>
          <button
            onClick={() => setFilter("low")}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{
              backgroundColor: filter === "low" ? "#1a0808" : "transparent",
              border: `1px solid ${filter === "low" ? "#f59e0b" : "#2a2a3f"}`,
              color: filter === "low" ? "#fbbf24" : "#6b6b8a",
            }}
          >
            Low Stock ({lowStockItems.length})
          </button>
        </div>
      </div>

      {/* Inventory List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredProducts.map((product) => {
            const stock = stockLevels.get(product.id);
            const isLow = stock && stock.quantity <= stock.reorderPoint;

            return (
              <div
                key={product.id}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: "#0d0d1a",
                  border: `1px solid ${isLow ? "#f59e0b" : "#1e1e30"}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold" style={{ color: "#e0d8f8" }}>
                      {product.name}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "#6b6b8a" }}>
                      {product.barcode} • {fmt(product.price)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Stock Level */}
                    <div className="text-right">
                      <div
                        className="text-2xl font-bold text-money"
                        style={{
                          color: isLow ? "#fbbf24" : "#86efac",
                        }}
                      >
                        {stock?.quantity || 0}
                      </div>
                      <div className="text-xs" style={{ color: "#6b6b8a" }}>
                        Reorder: {stock?.reorderPoint || 0}
                      </div>
                    </div>

                    {/* Adjust Button */}
                    <button
                      onClick={() => setAdjustingProduct(product.id)}
                      className="px-3 py-2 rounded-lg text-sm font-semibold"
                      style={{
                        backgroundColor: "#1f1040",
                        border: "1px solid #7c3aed",
                        color: "#c4b5fd",
                      }}
                    >
                      Adjust
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Adjust Modal */}
      {adjustingProduct && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.85)", zIndex: 100 }}
        >
          <div
            className="w-full max-w-md p-6 rounded-2xl"
            style={{
              backgroundColor: "#0d0d1a",
              border: "1px solid #3b1f6e",
            }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: "#e0d8f8" }}>
              Adjust Stock
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: "#c0b8d8" }}>
                  New Quantity
                </label>
                <input
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    backgroundColor: "#0f0f1c",
                    border: "1px solid #2a2a3f",
                    color: "#c8c0e0",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: "#c0b8d8" }}>
                  Reason
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g., Stock count, Damaged, etc."
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    backgroundColor: "#0f0f1c",
                    border: "1px solid #2a2a3f",
                    color: "#c8c0e0",
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setAdjustingProduct(null);
                  setAdjustQuantity("");
                  setAdjustReason("");
                }}
                className="flex-1 py-3 rounded-lg font-semibold"
                style={{
                  backgroundColor: "#1a0d0d",
                  border: "1px solid #7f1d1d",
                  color: "#fca5a5",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                className="flex-1 py-3 rounded-lg font-semibold"
                style={{
                  backgroundColor: "#7c3aed",
                  color: "#ffffff",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}