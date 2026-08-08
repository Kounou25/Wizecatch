import type { OperatingSystem, Browser } from "@/lib/mock-data";
import {
  siApple,
  siAndroid,
  siLinux,
  siGooglechrome,
  siFirefoxbrowser,
  siSafari,
} from "simple-icons";

export type PlatformIcon = { path: string; color: string };

const fromBrand = (icon: { hex: string; path: string }): PlatformIcon => ({
  path: icon.path,
  color: `#${icon.hex}`,
});

/**
 * Windows et Edge ne figurent plus dans simple-icons — les deux marques en ont
 * été retirées. Comme ce sont justement l'OS et un navigateur très répandus,
 * les remplacer par un glyphe générique donnerait un tableau qui a l'air cassé
 * là où il compte le plus. On redessine donc les deux dans le même gabarit.
 */
const WINDOWS: PlatformIcon = {
  // Drapeau à quatre volets, en perspective — le tracé historique du logo.
  path: "M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801",
  color: "#0078D6",
};

const EDGE: PlatformIcon = {
  // Approximation de la vague : reconnaissable, sans prétendre au tracé officiel.
  path: "M12 1.8c5.63 0 10.2 4.2 10.2 9.4 0 1.3-.3 2.5-.9 3.5-.9 1.6-2.6 2.6-4.5 2.6-2.7 0-4.9-2-4.9-4.5 0-1.9 1.2-3.5 3-4.2-4.4.2-8 3.3-8.9 7.4-.5-1.3-.8-2.7-.8-4.2 0-2.2.7-4.2 1.9-5.9C9 3.2 10.4 1.8 12 1.8ZM6.2 16.5c1.4 3.3 4.7 5.7 8.6 5.7 1.4 0 2.8-.3 4-.9-1 .4-2.1.6-3.2.6-4.2 0-7.8-2.3-9.4-5.4Z",
  color: "#2B8FD6",
};

/**
 * Clés strictement identiques aux valeurs produites par le parseur d'UA
 * (`parseOs` / `parseBrowser`) : toute divergence ferait disparaître l'icône
 * en silence, exactement comme les drapeaux indexés sur le mauvais champ.
 */
export const osIcons: Record<OperatingSystem, PlatformIcon> = {
  Windows: WINDOWS,
  macOS: fromBrand(siApple),
  iOS: fromBrand(siApple),
  Android: fromBrand(siAndroid),
  Linux: fromBrand(siLinux),
};

export const browserIcons: Record<Browser, PlatformIcon> = {
  Chrome: fromBrand(siGooglechrome),
  Safari: fromBrand(siSafari),
  Firefox: fromBrand(siFirefoxbrowser),
  Edge: EDGE,
};

export type IconSet = "os" | "browser";

export function platformIcon(set: IconSet, label: string): PlatformIcon | null {
  const table: Record<string, PlatformIcon> = set === "os" ? osIcons : browserIcons;
  return table[label] ?? null;
}
