"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { date: string; value: number };

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function StatsLineChart({
  data,
  color = "#7c3aed",
  valueFormatter,
}: {
  data: Point[];
  color?: string;
  valueFormatter?: (value: number) => string;
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            tickFormatter={formatDate}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e4e4e7",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
            labelFormatter={(value) =>
              new Date(String(value)).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            }
            formatter={(value) => [
              valueFormatter ? valueFormatter(Number(value)) : String(value ?? ""),
              "",
            ]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
