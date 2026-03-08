"use client";

import { fmt } from "@/lib/utils";

interface ChartData {
  label: string;
  value: number;
}

interface SimpleChartProps {
  data: ChartData[];
  title: string;
}

export function SimpleChart({ data, title }: SimpleChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div
      className="p-6 rounded-xl"
      style={{
        backgroundColor: "#0d0d1a",
        border: "1px solid #2a2a3f",
      }}
    >
      <h3 className="text-lg font-bold mb-6" style={{ color: "#e0d8f8" }}>
        {title}
      </h3>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: "#c0b8d8" }}>{item.label}</span>
              <span className="font-bold" style={{ color: "#a78bfa" }}>
                {fmt(item.value)}
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: "#1e1e30" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}