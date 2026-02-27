"use client";

import { useEffect, useState } from "react";
import { db, checkDBHealth } from "@/lib/db/schema";
import { syncProductsFromServer, getAllCategories } from "@/lib/db/products";

export default function POSPage() {
  const [dbStatus, setDbStatus] = useState<
    "checking" | "connected" | "error"
  >("checking");
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    supabaseConnected: false,
  });

  useEffect(() => {
    async function init() {
      try {
        // Check Supabase
        const supabaseTest = await fetch("/api/test-db");
        const supabaseData = await supabaseTest.json();

        if (!supabaseData.success) {
          setDbStatus("error");
          return;
        }

        // Sync products to IndexedDB
        const branchId = "01936d9e-9f5a-4b2c-9d3e-1111111111aa"; // Downtown store
        await syncProductsFromServer(branchId);

        // Get stats
        const health = await checkDBHealth();
        const categories = await getAllCategories();

        setStats({
          products: health.tables.products || 0,
          categories: categories.length,
          supabaseConnected: true,
        });

        setDbStatus("connected");
      } catch (error) {
        console.error("Initialization error:", error);
        setDbStatus("error");
      }
    }

    init();
  }, []);

  return (
    <div
      className="flex items-center justify-center h-screen flex-col gap-4"
      style={{ backgroundColor: "#07070f", color: "#e8e0f8" }}
    >
      <div className="text-5xl font-bold" style={{ color: "#7c3aed" }}>
        NEXUS
      </div>
      <div className="text-2xl font-bold tracking-tight">Point of Sale</div>

      <div className="mt-8 flex flex-col gap-3 items-center">
        <div className="text-sm" style={{ color: "#6b6b8a" }}>
          Phase 3: Offline Storage
        </div>

        {/* Supabase Status */}
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor:
                dbStatus === "connected"
                  ? "#22c55e"
                  : dbStatus === "error"
                  ? "#ef4444"
                  : "#f59e0b",
            }}
          />
          <span style={{ color: "#86efac", fontSize: "14px" }}>
            Supabase: {stats.supabaseConnected ? "Connected" : "Checking..."}
          </span>
        </div>

        {/* IndexedDB Status */}
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: stats.products > 0 ? "#22c55e" : "#f59e0b",
            }}
          />
          <span style={{ color: "#86efac", fontSize: "14px" }}>
            IndexedDB: {stats.products} products cached
          </span>
        </div>

        {/* Categories */}
        {stats.categories > 0 && (
          <div
            className="text-xs"
            style={{ color: "#6b6b8a", marginTop: "8px" }}
          >
            {stats.categories} categories loaded
          </div>
        )}
      </div>

      <div className="text-xs mt-8" style={{ color: "#3a3a55" }}>
        Next: Phase 4 - Authentication & Sessions
      </div>
    </div>
  );
}


