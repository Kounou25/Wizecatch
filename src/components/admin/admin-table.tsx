/** Primitives de tableau du back-office — sobres, denses, sans dépendance. */

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
      <div className="rounded-xl border border-zinc-200 bg-white py-12 text-center text-sm text-zinc-400">
        {empty}
      </div>
    );
  }

  return (
    // Le tableau défile dans son propre conteneur : la page ne doit jamais
    // défiler horizontalement.
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50/60">
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

export function Cell({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <td className={`px-4 py-3 ${muted ? "text-zinc-500" : "text-zinc-800"}`}>
      {children}
    </td>
  );
}

export function AdminStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <p className="text-xs font-medium text-zinc-400">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums text-zinc-900">
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
      </p>
    </div>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-lg font-semibold text-zinc-900">{title}</h1>
      <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>
    </div>
  );
}
