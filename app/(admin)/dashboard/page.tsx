"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { fmt } from "@/lib/utils";

interface DailySummary {
  date: string;
  totalTransactions: number;
  totalRevenue: number;
  totalTax: number;
  totalDiscount: number;
  netRevenue: number;
  byPaymentMethod: Record<string, number>;
  topProducts: Array<{
    productId: string;
    name: string;
    qty: number;
    revenue: number;
  }>;
}

interface BranchStats {
  branchId: string;
  branchName: string;
  branchCode: string;
  totalTransactions: number;
  revenue: number;
  netRevenue: number;
}

export default function DashboardPage() {
  const { branch, cashier } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dailyReport, setDailyReport] = useState<DailySummary | null>(null);
  const [branchReport, setBranchReport] = useState<{
    branches: BranchStats[];
    totalRevenue: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"daily" | "branches">("daily");

  useEffect(() => {
    if (!branch?.id) return;
    loadDailyReport();
  }, [branch?.id, selectedDate]);

  useEffect(() => {
    loadBranchReport();
  }, []);

  async function loadDailyReport() {
    if (!branch?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/reports/daily?branchId=${branch.id}&date=${selectedDate}`
      );
      if (!response.ok) throw new Error("Failed to load report");

      const data = await response.json();
      setDailyReport(data);
    } catch (error) {
      console.error("Report error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadBranchReport() {
    setIsLoading(true);
    try {
      // Last 30 days
      const to = new Date().toISOString();
      const from = new Date();
      from.setDate(from.getDate() - 30);

      const response = await fetch(
        `/api/reports/branches?from=${from.toISOString()}&to=${to}`
      );
      if (!response.ok) throw new Error("Failed to load branch report");

      const data = await response.json();
      setBranchReport(data);
    } catch (error) {
      console.error("Branch report error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!cashier || cashier.role === "cashier") {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ backgroundColor: "#07070f", color: "#ef4444" }}
      >
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <div className="text-xl font-bold">Access Denied</div>
          <div className="text-sm mt-2" style={{ color: "#6b6b8a" }}>
            Admin access required
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{ backgroundColor: "#07070f", color: "#e0d8f8" }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <div className="text-sm" style={{ color: "#6b6b8a" }}>
          {cashier?.name} • {branch?.name}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView("daily")}
          className="px-6 py-3 rounded-lg font-semibold"
          style={{
            backgroundColor: view === "daily" ? "#1f1040" : "#0d0d1a",
            border: `1px solid ${view === "daily" ? "#7c3aed" : "#2a2a3f"}`,
            color: view === "daily" ? "#c4b5fd" : "#6b6b8a",
          }}
        >
          Daily Report
        </button>
        <button
          onClick={() => setView("branches")}
          className="px-6 py-3 rounded-lg font-semibold"
          style={{
            backgroundColor: view === "branches" ? "#1f1040" : "#0d0d1a",
            border: `1px solid ${view === "branches" ? "#7c3aed" : "#2a2a3f"}`,
            color: view === "branches" ? "#c4b5fd" : "#6b6b8a",
          }}
        >
          Branch Comparison
        </button>
      </div>

      {/* Daily Report View */}
      {view === "daily" && (
        <>
          {/* Date Picker */}
          <div className="mb-6">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 rounded-lg"
              style={{
                backgroundColor: "#0d0d1a",
                border: "1px solid #2a2a3f",
                color: "#c8c0e0",
              }}
            />
          </div>

          {isLoading ? (
            <div className="text-center py-12" style={{ color: "#6b6b8a" }}>
              Loading report...
            </div>
          ) : dailyReport ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div
                  className="p-6 rounded-xl"
                  style={{
                    backgroundColor: "#0d0d1a",
                    border: "1px solid #2a2a3f",
                  }}
                >
                  <div className="text-xs mb-2" style={{ color: "#6b6b8a" }}>
                    TRANSACTIONS
                  </div>
                  <div className="text-3xl font-bold text-money" style={{ color: "#a78bfa" }}>
                    {dailyReport.totalTransactions}
                  </div>
                </div>

                <div
                  className="p-6 rounded-xl"
                  style={{
                    backgroundColor: "#0d0d1a",
                    border: "1px solid #2a2a3f",
                  }}
                >
                  <div className="text-xs mb-2" style={{ color: "#6b6b8a" }}>
                    GROSS REVENUE
                  </div>
                  <div className="text-3xl font-bold text-money" style={{ color: "#86efac" }}>
                    {fmt(dailyReport.totalRevenue)}
                  </div>
                </div>

                <div
                  className="p-6 rounded-xl"
                  style={{
                    backgroundColor: "#0d0d1a",
                    border: "1px solid #2a2a3f",
                  }}
                >
                  <div className="text-xs mb-2" style={{ color: "#6b6b8a" }}>
                    TAX COLLECTED
                  </div>
                  <div className="text-3xl font-bold text-money" style={{ color: "#fbbf24" }}>
                    {fmt(dailyReport.totalTax)}
                  </div>
                </div>

                <div
                  className="p-6 rounded-xl"
                  style={{
                    backgroundColor: "#0d2010",
                    border: "1px solid #166534",
                  }}
                >
                  <div className="text-xs mb-2" style={{ color: "#86efac" }}>
                    NET REVENUE
                  </div>
                  <div className="text-3xl font-bold text-money" style={{ color: "#4ade80" }}>
                    {fmt(dailyReport.netRevenue)}
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div
                className="p-6 rounded-xl mb-8"
                style={{
                  backgroundColor: "#0d0d1a",
                  border: "1px solid #2a2a3f",
                }}
              >
                <h3 className="text-lg font-bold mb-4">Payment Methods</h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(dailyReport.byPaymentMethod).map(
                    ([method, amount]) => (
                      <div key={method} className="flex justify-between p-3 rounded-lg" style={{ backgroundColor: "#0a0a14" }}>
                        <span className="capitalize">{method.replace("_", " ")}</span>
                        <span className="font-bold text-money">{fmt(amount)}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Top Products */}
              <div
                className="p-6 rounded-xl"
                style={{
                  backgroundColor: "#0d0d1a",
                  border: "1px solid #2a2a3f",
                }}
              >
                <h3 className="text-lg font-bold mb-4">Top Products</h3>
                <div className="space-y-3">
                  {dailyReport.topProducts.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{ backgroundColor: "#0a0a14" }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{
                            backgroundColor: index < 3 ? "#1f1040" : "#14141f",
                            color: index < 3 ? "#a78bfa" : "#6b6b8a",
                          }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-xs" style={{ color: "#6b6b8a" }}>
                            {product.qty} units sold
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-money" style={{ color: "#86efac" }}>
                        {fmt(product.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12" style={{ color: "#6b6b8a" }}>
              No data available for this date
            </div>
          )}
        </>
      )}

      {/* Branch Comparison View */}
      {view === "branches" && branchReport && (
        <>
          {/* Total Summary */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: "#0d0d1a",
                border: "1px solid #2a2a3f",
              }}
            >
              <div className="text-xs mb-2" style={{ color: "#6b6b8a" }}>
                TOTAL REVENUE (Last 30 Days)
              </div>
              <div className="text-3xl font-bold text-money" style={{ color: "#86efac" }}>
                {fmt(branchReport.totalRevenue)}
              </div>
            </div>

            <div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: "#0d0d1a",
                border: "1px solid #2a2a3f",
              }}
            >
              <div className="text-xs mb-2" style={{ color: "#6b6b8a" }}>
                TOTAL BRANCHES
              </div>
              <div className="text-3xl font-bold text-money" style={{ color: "#a78bfa" }}>
                {branchReport.branches.length}
              </div>
            </div>
          </div>

          {/* Branch List */}
          <div
            className="p-6 rounded-xl"
            style={{
              backgroundColor: "#0d0d1a",
              border: "1px solid #2a2a3f",
            }}
          >
            <h3 className="text-lg font-bold mb-4">Branch Performance</h3>
            <div className="space-y-3">
              {branchReport.branches.map((branch, index) => (
                <div
                  key={branch.branchId}
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: "#0a0a14",
                    border: index === 0 ? "1px solid #7c3aed" : "none",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{
                          backgroundColor: index === 0 ? "#1f1040" : "#14141f",
                          color: index === 0 ? "#a78bfa" : "#6b6b8a",
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{branch.branchName}</div>
                        <div className="text-xs" style={{ color: "#6b6b8a" }}>
                          {branch.branchCode}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-money" style={{ color: "#86efac" }}>
                        {fmt(branch.netRevenue)}
                      </div>
                      <div className="text-xs" style={{ color: "#6b6b8a" }}>
                        {branch.totalTransactions} transactions
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div
                    className="h-2 rounded-full mt-3"
                    style={{ backgroundColor: "#14141f" }}
                  >
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${
                          (branch.netRevenue / branchReport.totalRevenue) * 100
                        }%`,
                        backgroundColor: index === 0 ? "#7c3aed" : "#4ade80",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}