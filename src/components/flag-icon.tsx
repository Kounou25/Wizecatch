"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_SIZE = "h-4 w-6";

function Flag({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const clipId = `flag-clip-${useId()}`;
  return (
    <svg
      viewBox="0 0 30 20"
      className={cn(DEFAULT_SIZE, "shrink-0 rounded-[3px] ring-1 ring-black/10", className)}
      aria-hidden="true"
    >
      <clipPath id={clipId}>
        <rect width="30" height="20" rx="3" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>{children}</g>
    </svg>
  );
}

function Stripes({
  colors,
  direction = "horizontal",
  className,
}: {
  colors: string[];
  direction?: "horizontal" | "vertical";
  className?: string;
}) {
  const n = colors.length;
  return (
    <Flag className={className}>
      {colors.map((color, i) =>
        direction === "horizontal" ? (
          <rect key={i} x={0} y={(20 / n) * i} width={30} height={20 / n} fill={color} />
        ) : (
          <rect key={i} x={(30 / n) * i} y={0} width={30 / n} height={20} fill={color} />
        ),
      )}
    </Flag>
  );
}

const flagsByCountry: Record<string, (className?: string) => React.ReactElement> = {
  US: (className) => (
    <Flag className={className}>
      <rect width="30" height="20" fill="#B22234" />
      {[0, 2, 4, 6, 8, 10].map((i) => (
        <rect key={i} y={(20 / 13) * i} width="30" height={20 / 13} fill="#ffffff" />
      ))}
      <rect width="14" height={(20 / 13) * 7} fill="#3C3B6E" />
    </Flag>
  ),
  DE: (className) => (
    <Stripes className={className} colors={["#000000", "#DD0000", "#FFCE00"]} />
  ),
  GB: (className) => (
    <Flag className={className}>
      <rect width="30" height="20" fill="#00247D" />
      <path d="M0 0 L30 20 M30 0 L0 20" stroke="#ffffff" strokeWidth="4" />
      <path d="M0 0 L30 20 M30 0 L0 20" stroke="#CF142B" strokeWidth="1.6" />
      <rect x="12" width="6" height="20" fill="#ffffff" />
      <rect y="7" width="30" height="6" fill="#ffffff" />
      <rect x="13.2" width="3.6" height="20" fill="#CF142B" />
      <rect y="8.2" width="30" height="3.6" fill="#CF142B" />
    </Flag>
  ),
  CA: (className) => (
    <Flag className={className}>
      <rect width="30" height="20" fill="#ffffff" />
      <rect width="7.5" height="20" fill="#FF0000" />
      <rect x="22.5" width="7.5" height="20" fill="#FF0000" />
      <path
        d="M15 5 L16.5 9 L19 8 L17.5 11.5 L20 12.5 L17 13.5 L17.5 16 L15 14.5 L12.5 16 L13 13.5 L10 12.5 L12.5 11.5 L11 8 L13.5 9 Z"
        fill="#FF0000"
      />
    </Flag>
  ),
  FR: (className) => (
    <Stripes className={className} colors={["#0055A4", "#ffffff", "#EF4135"]} direction="vertical" />
  ),
  AU: (className) => (
    <Flag className={className}>
      <rect width="30" height="20" fill="#00008B" />
      <rect width="15" height="10" fill="#00247D" />
      <path d="M0 0 L15 10 M15 0 L0 10" stroke="#ffffff" strokeWidth="1.8" />
      <path d="M0 0 L15 10 M15 0 L0 10" stroke="#CF142B" strokeWidth="0.8" />
      <rect x="6" width="3" height="10" fill="#ffffff" />
      <rect y="3.5" width="15" height="3" fill="#ffffff" />
      <rect x="6.9" width="1.2" height="10" fill="#CF142B" />
      <rect y="4.4" width="15" height="1.2" fill="#CF142B" />
      {[
        [22, 4],
        [25, 9],
        [21, 14],
        [26, 15],
        [24, 6],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="0.8" fill="#ffffff" />
      ))}
    </Flag>
  ),
  NL: (className) => (
    <Stripes className={className} colors={["#AE1C28", "#ffffff", "#21468B"]} />
  ),
  BR: (className) => (
    <Flag className={className}>
      <rect width="30" height="20" fill="#009739" />
      <path d="M15 3 L27 10 L15 17 L3 10 Z" fill="#FEDD00" />
      <circle cx="15" cy="10" r="4" fill="#012169" />
    </Flag>
  ),
  IN: (className) => (
    <Stripes className={className} colors={["#FF9933", "#ffffff", "#138808"]} />
  ),
  JP: (className) => (
    <Flag className={className}>
      <rect width="30" height="20" fill="#ffffff" />
      <circle cx="15" cy="10" r="5.5" fill="#BC002D" />
    </Flag>
  ),
  IE: (className) => (
    <Stripes className={className} colors={["#169B62", "#ffffff", "#FF883E"]} direction="vertical" />
  ),
  PT: (className) => (
    <Flag className={className}>
      <rect width="30" height="20" fill="#FF0000" />
      <rect width="12" height="20" fill="#006600" />
      <circle cx="12" cy="10" r="3.4" fill="#FFCC00" stroke="#ffffff" strokeWidth="0.5" />
    </Flag>
  ),
  SE: (className) => (
    <Flag className={className}>
      <rect width="30" height="20" fill="#006AA7" />
      <rect x="10" width="4" height="20" fill="#FECC00" />
      <rect y="8" width="30" height="4" fill="#FECC00" />
    </Flag>
  ),
  ES: (className) => (
    <Flag className={className}>
      <rect width="30" height="20" fill="#AA151B" />
      <rect y="5" width="30" height="10" fill="#F1BF00" />
    </Flag>
  ),
  PL: (className) => <Stripes className={className} colors={["#ffffff", "#DC143C"]} />,
};

/**
 * Drapeau d'un pays à partir de son code ISO alpha-2 ("FR", "NE", "US").
 *
 * Seuls les pays les plus fréquents sont dessinés à la main. Pour tous les
 * autres, on affiche le code sur une pastille : c'est informatif et volontaire,
 * là où un carré gris vide passerait pour un bug.
 *
 * (Les emoji drapeaux seraient la solution évidente, mais Windows ne les rend
 * pas — c'est ce qui nous avait déjà fait basculer vers du SVG.)
 */
export function FlagIcon({ country, className }: { country: string; className?: string }) {
  const code = (country ?? "").trim().toUpperCase();
  const render = flagsByCountry[code];

  if (render) return render(className);

  return (
    <span
      className={cn(
        DEFAULT_SIZE,
        "flex shrink-0 items-center justify-center rounded-[3px] bg-zinc-100 text-[8px] font-bold leading-none tracking-tight text-zinc-500 ring-1 ring-black/10",
        className,
      )}
      title={code}
    >
      {code.length === 2 ? code : "?"}
    </span>
  );
}
