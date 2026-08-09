"use client";

import { useState } from "react";
import Link from "next/link";
import { GlobeIcon, CopyIcon, CheckIcon } from "@/components/icons";

/**
 * Actions rapides sur un compte.
 *
 * Volontairement limitées à ce qui est réversible. Deux fonctions manquent, et
 * c'est délibéré :
 *
 *   — accorder le droit d'administration, qui ferait de cette page la cible à
 *     attaquer : le drapeau ne s'attribue qu'en SQL ;
 *   — supprimer un compte, irréversible et qui effacerait en cascade les sites,
 *     les avis et les visites du client.
 */
export function UserActions({ userId, email }: { userId: string; email: string }) {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <span className="flex items-center gap-1">
      <Link
        href={`/admin/sites?user=${userId}`}
        title="View this account's sites"
        className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-700"
      >
        <GlobeIcon className="h-3.5 w-3.5" />
      </Link>

      <button
        type="button"
        onClick={copyEmail}
        title={copied ? "Copied" : "Copy email"}
        className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-700"
      >
        {copied ? (
          <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <CopyIcon className="h-3.5 w-3.5" />
        )}
      </button>

      <a
        href={`mailto:${email}`}
        title="Send an email"
        className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-700"
      >
        {/* Enveloppe : pas d'icône équivalente dans le jeu existant. */}
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-10 6L2 7" />
        </svg>
      </a>
    </span>
  );
}
