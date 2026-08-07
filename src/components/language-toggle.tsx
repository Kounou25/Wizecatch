"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/dictionaries";

const options: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "fr", label: "FR" },
];

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full bg-zinc-100 p-0.5 text-xs font-semibold",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLocale(option.value)}
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors duration-150",
            locale === option.value
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
