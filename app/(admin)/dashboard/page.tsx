"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { SalesCard } from "@/components/admin/sales-card";
import { SimpleChart } from "@/components/admin/simple-chart";
import {
  getDailySales,
  getCashierPerformance,
  getTopProductsByRevenue,
} from "@/lib/reports/analytics";
import { toDateString, fmt } from "@/lib/utils";
import type { DailySummary } from "@/types";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { branch, cashier } = useAuthStore();
  const router = useRouter();
  const [todaySales, setTodaySales] = useState<DailySummary | null>(null);
  const [cashierStats, setCashierStats] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!branch?.id) return;

      try {
        const today = toDateString(new Date());
        
        // Get today's sales
        const sales = await getDailySales(branch.id, today);
        setTodaySales(sales);

        // Get cashier performance (last 7 days)
        const sevenDaysAgo = toDateString(
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        const cashiers = await getCashierPerformance(branch.id, sevenDaysAgo, today);
        setCashierStats(cashiers);

        // Get top products
        const products = await getTopProductsByRevenue(branch.id, 5);
        setTopProducts(products);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [branch?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: "#07070f" }}>
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "#7c3aed", borderTopColor: "transparent" }}
          />
          <div style={{ color: "#6b6b8a" }}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#07070f" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#e0d8f8" }}>
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: "#6b6b8a" }}>
            {branch?.name} • {cashier?.name}
          </p>
        </div>
        <button
          onClick={() => router.push("/pos")}
          className="px-4 py-2 rounded-lg font-semibold"
          style={{
            backgroundColor: "#7c3aed",
            color: "#ffffff",
          }}
        >
          ← Back to POS
        </button>
      </div>

      {/* Sales Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <SalesCard
          title="Today's Revenue"
          value={todaySales?.totalRevenue || 0}
          subtitle={`${todaySales?.totalTransactions || 0} transactions`}
          icon="💰"
        />
        <SalesCard
          title="Net Revenue"
          value={todaySales?.netRevenue || 0}
          subtitle={`After ${fmt(todaySales?.totalRefunds || 0)} refunds`}
          icon="📊"
        />
        <SalesCard
          title="Total Tax"
          value={todaySales?.totalTax || 0}
          subtitle={`${((todaySales?.totalTax || 0) / (todaySales?.totalRevenue || 1) * 100).toFixed(1)}% of revenue`}
          icon="📋"
        />
        <SalesCard
          title="Discounts Given"
          value={todaySales?.totalDiscount || 0}
          subtitle={`${((todaySales?.totalDiscount || 0) / (todaySales?.totalRevenue || 1) * 100).toFixed(1)}% of revenue`}
          icon="🎫"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Top Products */}
        <SimpleChart
          title="Top Products (All Time)"
          data={topProducts.map((p) => ({
            label: p.name,
            value: p.revenue,
          }))}
        />

        {/* Cashier Performance */}
        <SimpleChart
          title="Cashier Performance (Last 7 Days)"
          data={cashierStats.map((c) => ({
            label: c.name,
            value: c.revenue,
          }))}
        />
      </div>

      {/* Payment Methods */}
      {todaySales && Object.keys(todaySales.byPaymentMethod).length > 0 && (
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: "#0d0d1a",
            border: "1px solid #2a2a3f",
          }}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: "#e0d8f8" }}>
            Payment Methods Today
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(todaySales.byPaymentMethod).map(([method, amount]) => (
              <div
                key={method}
                className="p-4 rounded-lg text-center"
                style={{ backgroundColor: "#14141f" }}
              >
                <div className="text-xs mb-2 uppercase" style={{ color: "#9f9fbe" }}>
                  {method.replace("_", " ")}
                </div>
                <div className="text-2xl font-bold" style={{ color: "#a78bfa" }}>
                  {fmt(amount as number)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}