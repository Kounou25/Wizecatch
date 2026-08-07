import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
}: {
  href?: string | null;
  className?: string;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* Le fichier source inclut un halo autour de l'icône : on agrandit et
          on recadre pour que l'icône remplisse le carré. next/image sert une
          version redimensionnée — pas les 1,3 Mo du PNG d'origine. */}
      <span className="relative flex h-7 w-7 shrink-0 overflow-hidden rounded-lg">
        <Image
          src="/logo.png"
          alt=""
          width={64}
          height={64}
          priority
          className="h-full w-full scale-[1.62] object-contain"
        />
      </span>
      <span className="text-base font-semibold tracking-tight text-zinc-900">
        Wizecatch
      </span>
    </span>
  );

  if (!href) return content;

  return <Link href={href}>{content}</Link>;
}
