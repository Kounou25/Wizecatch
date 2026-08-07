import Link from "next/link";
import { Logo } from "@/components/logo";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: { text: string; linkLabel: string; href: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{title}</h1>
            <p className="mt-1.5 text-sm text-zinc-500">{subtitle}</p>
          </div>

          <div className="mt-6">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          {footer.text}{" "}
          <Link href={footer.href} className="font-medium text-purple-600 hover:text-purple-700">
            {footer.linkLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
