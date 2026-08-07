import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg bg-white px-3 py-2 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-purple-600",
        className,
      )}
      {...props}
    />
  );
}
