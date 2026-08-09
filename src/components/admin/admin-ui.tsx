import { cn } from "@/lib/utils";

/** Primitives du back-office — sobres, denses, sans dépendance. */

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function Panel({
  title,
  hint,
  action,
  children,
  className,
}: {
  title?: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
        className,
      )}
    >
      {title && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
            {hint && <p className="mt-0.5 text-xs text-zinc-400">{hint}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "purple",
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  tone?: "purple" | "emerald" | "amber" | "zinc";
}) {
  const tones = {
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    zinc: "bg-zinc-100 text-zinc-500",
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            tones[tone],
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-zinc-900">
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
      </p>
      {hint && <p className="mt-1 text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

/**
 * Répartition en barres proportionnelles.
 *
 * Même principe que les statistiques client : la barre est le fond de la
 * ligne, ce qui reste lisible avec deux valeurs comme avec dix.
 */
export function SplitBars({
  data,
  emptyLabel,
}: {
  data: { label: string; count: number }[];
  emptyLabel: string;
}) {
  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-zinc-400">{emptyLabel}</p>;
  }

  const total = data.reduce((sum, entry) => sum + entry.count, 0);
  // Proportionnel au premier rang : sinon une valeur dominante réduirait
  // toutes les autres à un trait invisible.
  const max = Math.max(...data.map((entry) => entry.count), 1);

  return (
    <ul className="space-y-1">
      {data.map((entry) => (
        <li key={entry.label} className="relative flex h-9 items-center rounded-md">
          <div
            className="absolute inset-y-0 left-0 rounded-md bg-purple-100/70"
            style={{ width: `${Math.max((entry.count / max) * 100, 4)}%` }}
            aria-hidden="true"
          />
          <div className="relative flex w-full items-center justify-between gap-3 px-2.5">
            <span className="truncate text-sm capitalize text-zinc-700">{entry.label}</span>
            <span className="flex shrink-0 items-baseline gap-1.5">
              <span className="text-sm font-medium tabular-nums text-zinc-900">
                {entry.count}
              </span>
              <span className="w-9 text-right text-xs tabular-nums text-zinc-400">
                {total > 0 ? Math.round((entry.count / total) * 100) : 0}%
              </span>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Badge({
  children,
  tone = "zinc",
}: {
  children: React.ReactNode;
  tone?: "zinc" | "purple" | "emerald" | "red" | "amber";
}) {
  const tones = {
    zinc: "bg-zinc-100 text-zinc-600",
    purple: "bg-purple-50 text-purple-700",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function AdminTable({
  headers,
  children,
  empty,
  isEmpty,
}: {
  headers: string[];
  children: React.ReactNode;
  empty: string;
  isEmpty: boolean;
}) {
  if (isEmpty) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-12 text-center text-sm text-zinc-400">
        {empty}
      </div>
    );
  }

  return (
    // Le tableau défile dans son propre conteneur : la page ne doit jamais
    // défiler horizontalement.
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50/70">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-2.5 text-xs font-medium text-zinc-500"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ children }: { children: React.ReactNode }) {
  return <tr className="transition-colors duration-100 hover:bg-zinc-50/70">{children}</tr>;
}

export function Cell({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <td className={cn("px-4 py-3", muted ? "text-zinc-500" : "text-zinc-800")}>
      {children}
    </td>
  );
}
