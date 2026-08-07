import type {
  DeviceType,
  OperatingSystem,
  Browser,
  TrafficSource,
} from "@/lib/mock-data";

// ---------------------------------------------------------------------------
// User-Agent
//
// Parsing maison volontaire : notre granularité est grossière (5 OS,
// 4 navigateurs), ce que couvrent quelques expressions régulières. Une
// bibliothèque complète serait ~200 Ko pour une précision dont on n'a pas
// l'usage. Le prix à payer : les navigateurs exotiques tombent en "Other".
// ---------------------------------------------------------------------------

export function parseDevice(ua: string): DeviceType {
  if (/iPad/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    return "Tablet";
  }
  if (/Mobi|iPhone|iPod|Android/i.test(ua)) return "Mobile";
  return "Desktop";
}

export function parseOs(ua: string): OperatingSystem {
  // iPadOS 13+ s'annonce comme un Mac : on l'accepte, l'écart est marginal.
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Macintosh|Mac OS X/i.test(ua)) return "macOS";
  if (/Linux|X11|CrOS/i.test(ua)) return "Linux";
  return "Windows";
}

export function parseBrowser(ua: string): Browser {
  // L'ordre compte : Edge et Chrome contiennent tous deux "Chrome",
  // et Chrome contient "Safari".
  if (/Edg[A-Z]?\//i.test(ua)) return "Edge";
  if (/Firefox\/|FxiOS\//i.test(ua)) return "Firefox";
  if (/Chrome\/|CriOS\//i.test(ua)) return "Chrome";
  if (/Safari\//i.test(ua)) return "Safari";
  return "Chrome";
}

// ---------------------------------------------------------------------------
// Source de trafic
// ---------------------------------------------------------------------------

const SOURCE_BY_HOST: [RegExp, TrafficSource][] = [
  [/(^|\.)google\./i, "Google"],
  [/(^|\.)(twitter\.com|x\.com|t\.co)$/i, "X / Twitter"],
  [/(^|\.)producthunt\.com$/i, "Product Hunt"],
  [/(^|\.)news\.ycombinator\.com$/i, "Hacker News"],
  [/(^|\.)reddit\.com$/i, "Reddit"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/i, "LinkedIn"],
  [/(^|\.)github\.com$/i, "GitHub"],
];

/**
 * Transforme un referrer brut en source lisible.
 * Une navigation interne au site compte comme "Direct" : sans ça, chaque clic
 * interne créerait une source parasite portant le domaine du client.
 */
export function parseSource(referrer: string | null, siteDomain: string): TrafficSource {
  if (!referrer) return "Direct";

  let host: string;
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "Direct";
  }

  if (!host || host === siteDomain.replace(/^www\./, "")) return "Direct";

  for (const [pattern, source] of SOURCE_BY_HOST) {
    if (pattern.test(host)) return source;
  }

  // Domaine inconnu : on le range en "Direct" plutôt que d'inventer une
  // catégorie, le type TrafficSource étant fermé côté interface.
  return "Direct";
}

// ---------------------------------------------------------------------------
// Géolocalisation
// ---------------------------------------------------------------------------

/**
 * Pays et ville fournis gratuitement par Vercel dans les en-têtes de requête.
 * Aucune base GeoIP à maintenir. En local ces en-têtes n'existent pas.
 */
export function parseGeo(headers: Headers): { country: string | null; city: string | null } {
  const country = headers.get("x-vercel-ip-country");
  const rawCity = headers.get("x-vercel-ip-city");

  // Vercel encode la ville en URI (« New%20York »).
  let city: string | null = null;
  if (rawCity) {
    try {
      city = decodeURIComponent(rawCity);
    } catch {
      city = rawCity;
    }
  }

  return { country: country || null, city };
}

// ---------------------------------------------------------------------------
// Identité visiteur — sans cookie, sans stockage d'IP
// ---------------------------------------------------------------------------

function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}

/**
 * Empreinte visiteur = SHA-256(sel_du_jour + site + ip + user-agent).
 *
 * Le sel intègre la date : l'empreinte change chaque nuit, ce qui rend
 * volontairement impossible le suivi d'un visiteur d'un jour sur l'autre.
 * C'est ce qui permet de se passer de bandeau de consentement.
 *
 * Conséquence assumée : « récurrent » signifie « revenu dans la journée ».
 *
 * L'IP sert uniquement au calcul et n'est jamais stockée.
 */
export async function computeVisitorHash(
  headers: Headers,
  siteId: string,
  userAgent: string,
): Promise<string> {
  const day = new Date().toISOString().slice(0, 10);
  const secret = process.env.VISITOR_HASH_SECRET ?? "wizecatch-default-salt";

  const material = `${secret}:${day}:${siteId}:${clientIp(headers)}:${userAgent}`;

  // Web Crypto plutôt que le module node:crypto : fonctionne aussi bien
  // en runtime Node qu'en Edge, si la route venait à y être déplacée.
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(material));

  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
