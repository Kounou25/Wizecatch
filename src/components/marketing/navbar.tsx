"use client";

import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { MenuIcon, XIcon } from "@/components/icons";
import { useLanguage } from "@/components/providers/language-provider";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dict } = useLanguage();

  const navLinks = [
    { href: "#how-it-works", label: dict.nav.howItWorks },
    { href: "#pricing", label: dict.nav.pricing },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-600 transition-colors duration-150 hover:text-zinc-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          <Button href="/login" variant="ghost" size="sm">
            {dict.nav.login}
          </Button>
          <Button href="/signup" variant="primary" size="sm">
            {dict.nav.getStarted}
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-zinc-200 bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Button href="/login" variant="outline" size="md">
              {dict.nav.login}
            </Button>
            <Button href="/signup" variant="primary" size="md">
              {dict.nav.getStarted}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
