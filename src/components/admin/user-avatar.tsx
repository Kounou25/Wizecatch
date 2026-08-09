"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Avatar d'un compte.
 *
 * Deux raisons de gérer un repli plutôt que d'afficher l'image telle quelle :
 * une inscription par email n'a pas d'avatar du tout, et une URL Google peut
 * expirer. Dans les deux cas on montre les initiales — jamais une vignette
 * cassée.
 */
export function UserAvatar({
  name,
  email,
  src,
  className,
}: {
  name: string | null;
  email: string;
  src: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  const initials = (name?.trim() || email)
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const base = cn(
    "flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full",
    className,
  );

  if (!src || failed) {
    return (
      <span
        className={cn(base, "bg-zinc-100 text-[10px] font-semibold text-zinc-500")}
        aria-hidden="true"
      >
        {initials || "?"}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn(base, "object-cover ring-1 ring-black/5")}
    />
  );
}
