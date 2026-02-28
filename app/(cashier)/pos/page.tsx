"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { db, type IDBProduct } from "@/lib/db/schema";
import {
  getAllCategories,
  searchProducts,
  getProductsByCategory,
} from "@/lib/db/products";
import { ProductCard } from "@/components/pos/product-card";
import { CartLine } from "@/components/pos/cart-line";
import { PaymentModal } from "@/components/pos/payment-modal";
import { fmt } from "@/lib/utils";
import { saveTransaction } from "@/lib/db/transactions";
import { generateReceiptNumber } from "@/lib/utils";

export default function POSPage() {
  const { cashier, branch } = useAuthStore();
  const {
    items,
    discount,
    addItem,
    removeItem,
    updateQuantity,
    updateDiscount,
    setCartDiscount,
    getTotals,
    clear,
  } = useCartStore();

  const [products, setProducts] = useState<IDBProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  const totals = getTotals();

  useEffect(() => {
    async function loadData() {
      const cats = await getAllCategories();
      setCategories(cats);

      const prods = await getProductsByCategory("All");
      setProducts(prods);
    }
    loadData();
  }, []);

  async function handleCategoryChange(category: string) {
    setActiveCategory(category);
    const prods = await getProductsByCategory(category);
    setProducts(prods);
  }

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await searchProducts(query);
      setProducts(results);
    } else {
      const prods = await getProductsByCategory(activeCategory);
      setProducts(prods);
    }
  }

  async function handlePaymentComplete(payment: any) {
    if (!cashier || !branch) return;

    const receiptNumber = generateReceiptNumber(branch.code, 1);

    const transaction = await saveTransaction({
      type: "sale",
      terminalId: "temp-terminal-id", // TODO: Get from session
      branchId: branch.id,
      cashierId: cashier.id,
      cashierName: cashier.name,
      receiptNumber,
      items,
      payment: {
        method: payment.method,
        amount: payment.amount,
        change: payment.change,
      },
      subtotal: totals.subtotal,
      discount,
      discountAmt: totals.cartDiscount,
      tax: totals.tax,
      total: totals.total,
      status: "completed",
      completedAt: new Date().toISOString(),
      syncStatus: "pending",
    });

    setLastReceipt({
      ...transaction,
      payment,
      branch: branch.name,
    });

    setShowPayment(false);
    setShowReceipt(true);
  }

  function handleNewSale() {
    clear();
    setShowReceipt(false);
  }

  return (
    <div className="pos-screen">
      {/* LEFT: Product Grid */}
      <div className="flex-1 flex flex-col" style={{ backgroundColor: "#07070f" }}>
        {/* Search Bar */}
        <div className="p-4" style={{ borderBottom: "1px solid #14141f" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products or scan barcode..."
            className="w-full px-4 py-3 rounded-lg"
            style={{
              backgroundColor: "#0f0f1c",
              border: "1px solid #2a2a3f",
              color: "#c8c0e0",
            }}
          />
        </div>

        {/* Categories */}
        <div
          className="flex gap-2 px-4 py-3 overflow-x-auto"
          style={{ borderBottom: "1px solid #14141f" }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap"
              style={{
                border: `1px solid ${activeCategory === cat ? "#7c3aed" : "#1e1e30"}`,
                backgroundColor: activeCategory === cat ? "#1f1040" : "transparent",
                color: activeCategory === cat ? "#c4b5fd" : "#4a4a6a",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                inCart={items.some((i) => i.productId === product.id)}
                onAdd={(p) =>
                  addItem({
                    id: p.id,
                    barcode: p.barcode || "",
                    name: p.name,
                    price: p.price,
                    taxRate: p.taxRate,
                  })
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div
        className="w-96 flex flex-col"
        style={{
          backgroundColor: "#08080f",
          borderLeft: "1px solid #14141f",
        }}
      >
        {/* Cart Header */}
        <div
          className="p-4 flex justify-between items-center"
          style={{ borderBottom: "1px solid #14141f" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🛒</span>
            <span className="font-bold" style={{ color: "#e0d8f8" }}>
              Cart
            </span>
            <span
              className="px-2 py-1 rounded-full text-xs font-bold"
              style={{
                backgroundColor: "#1f1040",
                border: "1px solid #7c3aed",
                color: "#a78bfa",
              }}
            >
              {items.length}
            </span>
          </div>
          {items.length > 0 && (
            <button
              onClick={clear}
              className="px-3 py-1 rounded-lg text-xs font-semibold"
              style={{
                backgroundColor: "#1a0d0d",
                border: "1px solid #7f1d1d",
                color: "#fca5a5",
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full" style={{ color: "#2a2a3f" }}>
              <div className="text-5xl mb-4 opacity-40">🛒</div>
              <div className="text-sm font-semibold">Cart is empty</div>
              <div className="text-xs mt-2 opacity-70">
                Select products to begin
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <CartLine
                  key={item.productId}
                  item={item}
                  onUpdateQty={(qty) => updateQuantity(item.productId, qty)}
                  onUpdateDiscount={(disc) =>
                    updateDiscount(item.productId, disc)
                  }
                  onRemove={() => removeItem(item.productId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {items.length > 0 && (
          <div className="p-4" style={{ borderTop: "1px solid #14141f" }}>
            {/* Totals */}
            <div
              className="p-4 rounded-xl mb-4"
              style={{ backgroundColor: "#0a0a14" }}
            >
              <div className="flex justify-between text-sm mb-2" style={{ color: "#6b6b8a" }}>
                <span>Subtotal</span>
                <span className="text-money">{fmt(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2" style={{ color: "#6b6b8a" }}>
                <span>Tax (8%)</span>
                <span className="text-money">{fmt(totals.tax)}</span>
              </div>
              <div
                className="flex justify-between pt-3"
                style={{ borderTop: "1px solid #1e1e30" }}
              >
                <span className="text-lg font-bold" style={{ color: "#e0d8f8" }}>
                  TOTAL
                </span>
                <span
                  className="text-2xl font-bold text-money"
                  style={{ color: "#a78bfa" }}
                >
                  {fmt(totals.total)}
                </span>
              </div>
            </div>

            {/* Charge Button */}
            <button
              onClick={() => setShowPayment(true)}
              className="w-full py-4 rounded-xl font-bold text-lg"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
                color: "#ffffff",
                boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
              }}
            >
              ⚡ Charge {fmt(totals.total)}
            </button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          total={totals.total}
          onComplete={handlePaymentComplete}
          onClose={() => setShowPayment(false)}
        />
      )}

      {/* Receipt Modal */}
      {showReceipt && lastReceipt && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.85)", zIndex: 100 }}
        >
          <div
            className="w-80 p-6 rounded-2xl text-sm"
            style={{
              backgroundColor: "#ffffff",
              color: "#000000",
              fontFamily: "monospace",
            }}
          >
            <div className="text-center mb-4" style={{ borderBottom: "2px dashed #ccc", paddingBottom: 12 }}>
              <div className="text-xl font-bold">NEXUS POS</div>
              <div className="text-xs mt-1">{lastReceipt.branch}</div>
              <div className="text-xs">{new Date().toLocaleString()}</div>
              <div className="text-xs mt-1">{lastReceipt.receiptNumber}</div>
            </div>

            <div className="mb-4">
              {lastReceipt.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs">
                      {item.qty} × {fmt(item.price)}
                    </div>
                  </div>
                  <div className="font-bold">{fmt(item.lineTotal)}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "2px dashed #ccc", paddingTop: 12 }}>
              <div className="flex justify-between mb-1">
                <span>Subtotal</span>
                <span>{fmt(lastReceipt.subtotal)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Tax</span>
                <span>{fmt(lastReceipt.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2">
                <span>TOTAL</span>
                <span>{fmt(lastReceipt.total)}</span>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span>Payment: {lastReceipt.payment.method}</span>
                {lastReceipt.payment.change && (
                  <span>Change: {fmt(lastReceipt.payment.change)}</span>
                )}
              </div>
            </div>

            <button
              onClick={handleNewSale}
              className="w-full mt-6 py-3 rounded-lg font-bold"
              style={{ backgroundColor: "#7c3aed", color: "#fff" }}
            >
              🖨️ New Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
}