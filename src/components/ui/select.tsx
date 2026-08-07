import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@/components/icons";

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-lg bg-white pl-3 pr-9 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-300 transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-purple-600",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
    </div>
  );
}
