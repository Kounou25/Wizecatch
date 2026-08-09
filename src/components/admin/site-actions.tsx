"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLinkIcon, CopyIcon, CheckIcon, UsersIcon } from "@/components/icons";

/**
 * Actions rapides sur un site.
 *
 * Toutes sont en lecture ou en navigation : archiver ou supprimer un site
 * appartient à son propriétaire, pas à l'administrateur de la plateforme. Le
 * back-office sert ici au diagnostic et au support.
 */
export function SiteActions({
  domain,
  publicKey,
  ownerEmail,
}: {
  domain: string;
  publicKey: string;
  ownerEmail: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const button =
    "flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-700";

  return (
    <span className="flex items-center gap-1">
      <a
        href={`https://${domain}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Open the site"
        className={button}
      >
        <ExternalLinkIcon className="h-3.5 w-3.5" />
      </a>

      <button
        type="button"
        onClick={copyKey}
        title={copied ? "Copied" : `Copy site key (${publicKey})`}
        className={button}
      >
        {copied ? (
          <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <CopyIcon className="h-3.5 w-3.5" />
        )}
      </button>

      <Link
        href={`/admin/users?q=${encodeURIComponent(ownerEmail)}`}
        title="Find the owner"
        className={button}
      >
        <UsersIcon className="h-3.5 w-3.5" />
      </Link>
    </span>
  );
}
