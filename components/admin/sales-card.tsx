"use client";

import { fmt } from "@/lib/utils";

interface SalesCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function SalesCard({ title, value, subtitle, icon, trend }: SalesCardProps) {
  return (
    <div
      className="p-6 rounded-xl"
      style={{
        backgroundColor: "#0d0d1a",
        border: "1px solid #2a2a3f",
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="text-sm font-semibold" style={{ color: "#9f9fbe" }}>
          {title}
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>

      <div className="text-3xl font-bold mb-2" style={{ color: "#e0d8f8" }}>
        {typeof value === "number" ? fmt(value) : value}
      </div>

      {subtitle && (
        <div className="text-xs" style={{ color: "#6b6b8a" }}>
          {subtitle}
        </div>
      )}

      {trend && (
        <div
          className="mt-2 text-xs font-semibold"
          style={{ color: trend.isPositive ? "#86efac" : "#fca5a5" }}
        >
          {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value).toFixed(1)}% vs yesterday
        </div>
      )}
    </div>
  );
}