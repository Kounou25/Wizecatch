export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-zinc-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-zinc-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
