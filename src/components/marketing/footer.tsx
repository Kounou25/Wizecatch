"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { useLanguage } from "@/components/providers/language-provider";

export function Footer() {
  const { dict } = useLanguage();

  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-sm text-zinc-500">{dict.footer.tagline}</p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500">
          <a href="#how-it-works" className="hover:text-zinc-900">
            {dict.nav.howItWorks}
          </a>
          <a href="#pricing" className="hover:text-zinc-900">
            {dict.nav.pricing}
          </a>
          <Link href="/login" className="hover:text-zinc-900">
            {dict.nav.login}
          </Link>
          <Link href="/signup" className="hover:text-zinc-900">
            {dict.auth.signupLink}
          </Link>
        </nav>
      </div>
      <div className="border-t border-zinc-100 px-6 py-4">
        <p className="mx-auto max-w-6xl text-xs text-zinc-400">
          © {new Date().getFullYear()} Wizecatch. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
