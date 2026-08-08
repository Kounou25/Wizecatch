"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RatingBreakdownEntry } from "@/lib/mock-data";
import { platformIcon, type IconSet } from "@/components/dashboard/platform-icons";

/** Largeur réservée aux libellés de l'axe vertical. */
const AXIS_WIDTH = 110;

type TickProps = {
  x?: number;
  y?: number;
  payload?: { value?: string };
};

/**
 * Libellé d'axe avec la marque devant le nom.
 *
 * Recharts n'accepte qu'un élément SVG ici : l'icône est donc tracée en SVG
 * natif, mise à l'échelle depuis son gabarit 24×24 vers 16 px.
 */
function IconTick({ x = 0, y = 0, payload, set }: TickProps & { set: IconSet }) {
  const label = payload?.value ?? "";
  const icon = platformIcon(set, label);
  const left = x - AXIS_WIDTH + 2;

  return (
    <g transform={`translate(${left},${y})`}>
      {icon && (
        <g transform="translate(0,-8) scale(0.6667)">
          <path d={icon.path} fill={icon.color} />
        </g>
      )}
      {/* Sans icône, le texte reprend la place : pas de trou dans la colonne. */}
      <text x={icon ? 22 : 0} y={4} fontSize={12} fill="#3f3f46">
        {label}
      </text>
    </g>
  );
}

export function RatingBreakdownChart({
  data,
  iconSet,
}: {
  data: RatingBreakdownEntry[];
  /** Affiche la marque de l'OS ou du navigateur devant chaque libellé. */
  iconSet?: IconSet;
}) {
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
            tick={
              iconSet ? <IconTick set={iconSet} /> : { fontSize: 12, fill: "#3f3f46" }
            }
            axisLine={false}
            tickLine={false}
            width={AXIS_WIDTH}
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
