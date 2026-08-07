import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg bg-white px-3 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-purple-600",
        className,
      )}
      {...props}
    />
  );
}
