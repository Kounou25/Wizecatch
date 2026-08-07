import {
  siNextdotjs,
  siWordpress,
  siWebflow,
  siShopify,
  siFramer,
  siSquarespace,
  siAstro,
  siHtml5,
} from "simple-icons";
import { cn } from "@/lib/utils";

type SimpleIcon = { title: string; hex: string; path: string };

/**
 * Official brand marks from simple-icons, rendered in each brand's own colour.
 * Trademarks belong to their owners; these identify supported integrations.
 */
function BrandLogo({ icon, className }: { icon: SimpleIcon; className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      className={cn("h-7 w-7 shrink-0", className)}
      fill={`#${icon.hex}`}
      aria-hidden="true"
    >
      <path d={icon.path} />
    </svg>
  );
}

/** Keyed by the integration names used in mock-data. */
export const brandLogos: Record<string, (className?: string) => React.ReactElement> = {
  "Next.js": (className) => <BrandLogo icon={siNextdotjs} className={className} />,
  WordPress: (className) => <BrandLogo icon={siWordpress} className={className} />,
  Webflow: (className) => <BrandLogo icon={siWebflow} className={className} />,
  Shopify: (className) => <BrandLogo icon={siShopify} className={className} />,
  Framer: (className) => <BrandLogo icon={siFramer} className={className} />,
  Squarespace: (className) => <BrandLogo icon={siSquarespace} className={className} />,
  Astro: (className) => <BrandLogo icon={siAstro} className={className} />,
  "Plain HTML": (className) => <BrandLogo icon={siHtml5} className={className} />,
};

export function TechLogo({ name, className }: { name: string; className?: string }) {
  const render = brandLogos[name];
  if (!render) {
    return <span className={cn("h-7 w-7 shrink-0 rounded bg-zinc-200", className)} aria-hidden="true" />;
  }
  return render(className);
}
