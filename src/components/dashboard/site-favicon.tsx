"use client";

import { useState } from "react";
import { GlobeIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Favicon du domaine, avec repli sur l'icône globe.
 *
 * On passe par le service de Google plutôt que d'attaquer /favicon.ico
 * directement : beaucoup de sites déclarent leur icône via <link rel="icon">
 * ailleurs qu'à la racine, et ce service gère aussi les redirections et les
 * formats exotiques. Voir le commentaire en bas pour l'alternative auto-hébergée.
 */
export function SiteFavicon({
  domain,
  size = "md",
  className,
}: {
  domain: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  const box = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-10 w-10 rounded-lg",
    lg: "h-12 w-12 rounded-xl",
  }[size];

  const img = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-zinc-100 text-zinc-500",
        box,
        className,
      )}
    >
      {failed || !domain ? (
        <GlobeIcon className={img} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`}
          alt=""
          width={64}
          height={64}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={cn(img, "rounded-sm object-contain")}
        />
      )}
    </span>
  );
}
