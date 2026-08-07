"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function formatHour(hour: number) {
  return `${String(hour).padStart(2, "0")}h`;
}

export function HourlyChart({ data }: { data: { hour: number; visits: number }[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
          <XAxis
            dataKey="hour"
            tickFormatter={formatHour}
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            axisLine={false}
            tickLine={false}
            width={32}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e4e4e7",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
            cursor={{ fill: "#faf5ff" }}
            labelFormatter={(value) => `${formatHour(Number(value))} – ${formatHour((Number(value) + 1) % 24)}`}
          />
          <Bar dataKey="visits" fill="#7c3aed" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
