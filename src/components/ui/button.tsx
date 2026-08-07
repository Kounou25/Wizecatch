import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-purple-600 text-white shadow-sm hover:bg-purple-700 focus-visible:outline-purple-600",
  secondary:
    "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 focus-visible:outline-zinc-900",
  outline:
    "bg-white text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 focus-visible:outline-zinc-400",
  ghost:
    "bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-zinc-400",
  danger:
    "bg-white text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-50 focus-visible:outline-red-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

const shared =
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0 disabled:active:scale-100";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonAsButton | ButtonAsLink) {
  const classes = cn(shared, variantClasses[variant], sizeClasses[size], className);

  if ("href" in rest && rest.href) {
    const { href, target, rel } = rest;
    return (
      <Link href={href} target={target} rel={rel} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
