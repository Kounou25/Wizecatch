"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RatingBreakdownEntry } from "@/lib/mock-data";

export function RatingBreakdownChart({ data }: { data: RatingBreakdownEntry[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 12, fill: "#3f3f46" }}
            axisLine={false}
            tickLine={false}
            width={110}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e4e4e7",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
            cursor={{ fill: "#faf5ff" }}
          />
          <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
