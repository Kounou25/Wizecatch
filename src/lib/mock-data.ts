// ---------------------------------------------------------------------------
// Seeded pseudo-random helpers — deterministic so server/client renders match
// ---------------------------------------------------------------------------

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function mulberry32(seed: number) {
  let state = seed;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SiteMode = "reviews" | "analytics_only";

export type ReviewTemplateId =
  | "star_rating"
  | "star_comment"
  | "thumbs"
  | "nps"
  | "testimonial";

export type ReviewStatus = "published" | "pending" | "hidden";

export type WidgetPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "inline";

export type WidgetTrigger = "load" | "scroll" | "delay";

export type WidgetFormat = "carousel" | "grid" | "list" | "popup";

export type WidgetSettings = {
  position: WidgetPosition;
  trigger: WidgetTrigger;
  format: WidgetFormat;
};

export type ReviewTemplateDef = {
  id: ReviewTemplateId;
  name: string;
  description: string;
};

export type TemplateCustomization = {
  title: string;
  buttonLabel: string;
};

export type Site = {
  id: string;
  /** Valeur du data-site dans le snippet. Absente des sites de démonstration. */
  publicKey?: string;
  name: string;
  domain: string;
  mode: SiteMode;
  templateId?: ReviewTemplateId;
  templateCustomization?: TemplateCustomization;
  visitCount: number;
  createdAt: string;
  widgetSettings: WidgetSettings;
};

export type Review = {
  id: string;
  siteId: string;
  templateId: ReviewTemplateId;
  authorName: string;
  authorInitial: string;
  comment?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  thumbsUp?: boolean;
  npsScore?: number;
  city: string;
  country: string;
  date: string;
  status: ReviewStatus;
};

export type DeviceType = "Desktop" | "Mobile" | "Tablet";
export type OperatingSystem = "Windows" | "macOS" | "iOS" | "Android" | "Linux";
export type Browser = "Chrome" | "Safari" | "Firefox" | "Edge";
export type TrafficSource =
  | "Direct"
  | "Google"
  | "X / Twitter"
  | "Product Hunt"
  | "Hacker News"
  | "Reddit"
  | "LinkedIn"
  | "GitHub";

export type VisitStat = {
  date: string;
  country: string;
  city: string;
  device: DeviceType;
  os: OperatingSystem;
  browser: Browser;
  source: TrafficSource;
  path: string;
  /** Time spent on the site, in seconds. */
  durationSeconds: number;
  /** Local hour of the visit, 0–23. */
  hour: number;
  isNewVisitor: boolean;
};

export type DailyMetric = {
  date: string;
  reviews: number;
  score: number;
};

export type Account = {
  name: string;
  email: string;
  initials: string;
  plan: "Free" | "Pro";
  joinedDate: string;
};

// ---------------------------------------------------------------------------
// Review templates
// ---------------------------------------------------------------------------

export const reviewTemplates: ReviewTemplateDef[] = [
  {
    id: "star_rating",
    name: "Star Rating",
    description: "A simple 1–5 star rating. Fastest way for visitors to leave feedback.",
  },
  {
    id: "star_comment",
    name: "Star Rating + Comment",
    description: "Star rating paired with an optional written comment for more context.",
  },
  {
    id: "thumbs",
    name: "Thumbs Up / Down",
    description: "A single-tap like or dislike — the lowest-friction option available.",
  },
  {
    id: "nps",
    name: "NPS Score",
    description: "0–10 likelihood-to-recommend score with an optional comment.",
  },
  {
    id: "testimonial",
    name: "Testimonial",
    description: "Open-ended name and text testimonial, no rating attached.",
  },
];

export function getTemplateById(id: ReviewTemplateId): ReviewTemplateDef {
  const template = reviewTemplates.find((t) => t.id === id);
  if (!template) throw new Error(`Unknown template: ${id}`);
  return template;
}

export const defaultTemplateCustomization: Record<ReviewTemplateId, TemplateCustomization> = {
  star_rating: { title: "How was your experience?", buttonLabel: "Submit" },
  star_comment: { title: "How was your experience?", buttonLabel: "Submit review" },
  thumbs: { title: "Did you enjoy using this?", buttonLabel: "Submit" },
  nps: { title: "How likely are you to recommend us? (0–10)", buttonLabel: "Submit score" },
  testimonial: { title: "Share your experience", buttonLabel: "Submit testimonial" },
};

// ---------------------------------------------------------------------------
// Widget setting options
// ---------------------------------------------------------------------------

export const widgetPositions: { value: WidgetPosition; label: string }[] = [
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "top-right", label: "Top right" },
  { value: "top-left", label: "Top left" },
  { value: "inline", label: "Inline (embedded in page)" },
];

export const widgetTriggers: { value: WidgetTrigger; label: string }[] = [
  { value: "load", label: "On page load" },
  { value: "scroll", label: "On scroll into view" },
  { value: "delay", label: "After a 5s delay" },
];

export const widgetFormats: { value: WidgetFormat; label: string }[] = [
  { value: "carousel", label: "Carousel" },
  { value: "grid", label: "Grid" },
  { value: "list", label: "List" },
  { value: "popup", label: "Popup card" },
];

// ---------------------------------------------------------------------------
// Sites
// ---------------------------------------------------------------------------

export const sites: Site[] = [
  {
    id: "launchbase",
    name: "Launchbase",
    domain: "launchbase.app",
    mode: "reviews",
    templateId: "star_comment",
    templateCustomization: defaultTemplateCustomization.star_comment,
    visitCount: 18420,
    createdAt: "2025-11-02",
    widgetSettings: { position: "bottom-right", trigger: "load", format: "carousel" },
  },
  {
    id: "formly",
    name: "Formly",
    domain: "formly.io",
    mode: "reviews",
    templateId: "star_rating",
    templateCustomization: defaultTemplateCustomization.star_rating,
    visitCount: 9870,
    createdAt: "2025-09-14",
    widgetSettings: { position: "bottom-left", trigger: "scroll", format: "grid" },
  },
  {
    id: "pixeldeck",
    name: "Pixeldeck",
    domain: "pixeldeck.co",
    mode: "reviews",
    templateId: "testimonial",
    templateCustomization: defaultTemplateCustomization.testimonial,
    visitCount: 4210,
    createdAt: "2026-01-08",
    widgetSettings: { position: "inline", trigger: "load", format: "list" },
  },
  {
    id: "notebase",
    name: "Notebase",
    domain: "notebase.so",
    mode: "analytics_only",
    visitCount: 26310,
    createdAt: "2026-06-21",
    widgetSettings: { position: "bottom-right", trigger: "load", format: "list" },
  },
  {
    id: "devnotes",
    name: "Devnotes",
    domain: "devnotes.io",
    mode: "reviews",
    templateId: "nps",
    templateCustomization: defaultTemplateCustomization.nps,
    visitCount: 7640,
    createdAt: "2026-03-11",
    widgetSettings: { position: "bottom-right", trigger: "delay", format: "popup" },
  },
  {
    id: "boltform",
    name: "Boltform",
    domain: "boltform.dev",
    mode: "reviews",
    templateId: "thumbs",
    templateCustomization: defaultTemplateCustomization.thumbs,
    visitCount: 3120,
    createdAt: "2026-05-02",
    widgetSettings: { position: "top-right", trigger: "load", format: "popup" },
  },
];

// ---------------------------------------------------------------------------
// Reviews — hand-authored, template-appropriate shape per site
// ---------------------------------------------------------------------------

export const reviews: Review[] = [
  // launchbase — star_comment
  {
    id: "r1",
    siteId: "launchbase",
    templateId: "star_comment",
    authorName: "Maya Torres",
    authorInitial: "M",
    rating: 5,
    comment:
      "Set this up in about four minutes and reviews started rolling in the same day. The widget looks like it was built by our own team, not a third party.",
    city: "Austin",
    country: "United States",
    date: "2026-07-28",
    status: "published",
  },
  {
    id: "r2",
    siteId: "launchbase",
    templateId: "star_comment",
    authorName: "Jonas Weber",
    authorInitial: "J",
    rating: 5,
    comment:
      "Finally a review widget that doesn't slow down the page. Lighthouse score didn't move at all after adding the script.",
    city: "Berlin",
    country: "Germany",
    date: "2026-07-21",
    status: "published",
  },
  {
    id: "r3",
    siteId: "launchbase",
    templateId: "star_comment",
    authorName: "Priya Nair",
    authorInitial: "P",
    rating: 4,
    comment:
      "Does exactly what it says. Would like a bit more control over the font weight in the free plan, but that's a minor gripe.",
    city: "Toronto",
    country: "Canada",
    date: "2026-07-15",
    status: "published",
  },
  {
    id: "r4",
    siteId: "launchbase",
    templateId: "star_comment",
    authorName: "Owen Clarke",
    authorInitial: "O",
    rating: 3,
    comment:
      "Works well overall. Had a small issue with the carousel timing on mobile Safari that took a moment to notice.",
    city: "London",
    country: "United Kingdom",
    date: "2026-07-09",
    status: "pending",
  },
  {
    id: "r5",
    siteId: "launchbase",
    templateId: "star_comment",
    authorName: "Sofia Almeida",
    authorInitial: "S",
    rating: 5,
    comment:
      "The one-line embed sold me instantly. No dashboard sprawl, no config files — just a script tag and it works.",
    city: "Lisbon",
    country: "Portugal",
    date: "2026-06-30",
    status: "published",
  },
  {
    id: "r6",
    siteId: "launchbase",
    templateId: "star_comment",
    authorName: "Ethan Park",
    authorInitial: "E",
    rating: 2,
    comment:
      "Widget itself is solid, but I expected CSV export on the free tier. Had to upgrade sooner than planned.",
    city: "Sydney",
    country: "Australia",
    date: "2026-06-22",
    status: "hidden",
  },
  {
    id: "r7",
    siteId: "launchbase",
    templateId: "star_comment",
    authorName: "Liam Fitzgerald",
    authorInitial: "L",
    rating: 5,
    comment:
      "Swapped out a much heavier review platform for this. Page load improved and the reviews still look premium.",
    city: "Dublin",
    country: "Ireland",
    date: "2026-06-11",
    status: "published",
  },
  {
    id: "r8",
    siteId: "launchbase",
    templateId: "star_comment",
    authorName: "Hannah Kim",
    authorInitial: "H",
    rating: 4,
    comment:
      "Great product. Support answered a config question within the hour, which I wasn't expecting from a small team.",
    city: "Amsterdam",
    country: "Netherlands",
    date: "2026-05-30",
    status: "published",
  },

  // formly — star_rating (no comment)
  {
    id: "r9",
    siteId: "formly",
    templateId: "star_rating",
    authorName: "Noah Bennett",
    authorInitial: "N",
    rating: 5,
    city: "San Francisco",
    country: "United States",
    date: "2026-07-19",
    status: "published",
  },
  {
    id: "r10",
    siteId: "formly",
    templateId: "star_rating",
    authorName: "Ines Moreau",
    authorInitial: "I",
    rating: 4,
    city: "Paris",
    country: "France",
    date: "2026-07-12",
    status: "published",
  },
  {
    id: "r11",
    siteId: "formly",
    templateId: "star_rating",
    authorName: "Marcus Alden",
    authorInitial: "M",
    rating: 5,
    city: "Chicago",
    country: "United States",
    date: "2026-07-03",
    status: "published",
  },
  {
    id: "r12",
    siteId: "formly",
    templateId: "star_rating",
    authorName: "Yuki Tanaka",
    authorInitial: "Y",
    rating: 3,
    city: "Osaka",
    country: "Japan",
    date: "2026-06-25",
    status: "pending",
  },
  {
    id: "r13",
    siteId: "formly",
    templateId: "star_rating",
    authorName: "Grace O'Sullivan",
    authorInitial: "G",
    rating: 5,
    city: "Dublin",
    country: "Ireland",
    date: "2026-06-14",
    status: "published",
  },
  {
    id: "r14",
    siteId: "formly",
    templateId: "star_rating",
    authorName: "Tomasz Nowak",
    authorInitial: "T",
    rating: 2,
    city: "Warsaw",
    country: "Poland",
    date: "2026-06-02",
    status: "hidden",
  },

  // pixeldeck — testimonial (no rating)
  {
    id: "r15",
    siteId: "pixeldeck",
    templateId: "testimonial",
    authorName: "Camille Laurent",
    authorInitial: "C",
    comment:
      "The inline display format blends into our product pages perfectly. Visitors don't even realize it's a third-party widget.",
    city: "Montreal",
    country: "Canada",
    date: "2026-07-02",
    status: "published",
  },
  {
    id: "r16",
    siteId: "pixeldeck",
    templateId: "testimonial",
    authorName: "Diego Fernandez",
    authorInitial: "D",
    comment:
      "We collect testimonials from every closed deal now. It's become part of our sales handoff checklist.",
    city: "Madrid",
    country: "Spain",
    date: "2026-06-18",
    status: "published",
  },
  {
    id: "r17",
    siteId: "pixeldeck",
    templateId: "testimonial",
    authorName: "Anna Kowalska",
    authorInitial: "A",
    comment:
      "Short, honest, and easy to skim — exactly what a testimonial section should be. Ours converts noticeably better since adding it.",
    city: "Warsaw",
    country: "Poland",
    date: "2026-06-05",
    status: "published",
  },
  {
    id: "r18",
    siteId: "pixeldeck",
    templateId: "testimonial",
    authorName: "Ben Whitfield",
    authorInitial: "B",
    comment:
      "No rating pressure, just a quote. A few of our customers who never leave star reviews wrote one for us here.",
    city: "Bristol",
    country: "United Kingdom",
    date: "2026-05-21",
    status: "pending",
  },
  {
    id: "r19",
    siteId: "pixeldeck",
    templateId: "testimonial",
    authorName: "Renata Silva",
    authorInitial: "R",
    comment:
      "Clean, minimal, on-brand. It took less time to set up than writing this testimonial.",
    city: "São Paulo",
    country: "Brazil",
    date: "2026-05-09",
    status: "published",
  },

  // devnotes — nps
  {
    id: "r20",
    siteId: "devnotes",
    templateId: "nps",
    authorName: "Freya Larsen",
    authorInitial: "F",
    npsScore: 10,
    comment: "Would recommend to any indie dev without hesitation.",
    city: "Stockholm",
    country: "Sweden",
    date: "2026-07-24",
    status: "published",
  },
  {
    id: "r21",
    siteId: "devnotes",
    templateId: "nps",
    authorName: "Miguel Santos",
    authorInitial: "M",
    npsScore: 9,
    comment: "Great product, occasionally slow support replies.",
    city: "Lisbon",
    country: "Portugal",
    date: "2026-07-10",
    status: "published",
  },
  {
    id: "r22",
    siteId: "devnotes",
    templateId: "nps",
    authorName: "Chidi Okafor",
    authorInitial: "C",
    npsScore: 7,
    city: "Toronto",
    country: "Canada",
    date: "2026-06-28",
    status: "published",
  },
  {
    id: "r23",
    siteId: "devnotes",
    templateId: "nps",
    authorName: "Elena Popescu",
    authorInitial: "E",
    npsScore: 5,
    comment: "Solid but missing a few integrations we need.",
    city: "Berlin",
    country: "Germany",
    date: "2026-06-15",
    status: "pending",
  },
  {
    id: "r24",
    siteId: "devnotes",
    templateId: "nps",
    authorName: "Ravi Chandran",
    authorInitial: "R",
    npsScore: 9,
    city: "Bangalore",
    country: "India",
    date: "2026-06-01",
    status: "published",
  },

  // boltform — thumbs
  {
    id: "r25",
    siteId: "boltform",
    templateId: "thumbs",
    authorName: "Casey Morgan",
    authorInitial: "C",
    thumbsUp: true,
    comment: "Fast and simple.",
    city: "Austin",
    country: "United States",
    date: "2026-07-20",
    status: "published",
  },
  {
    id: "r26",
    siteId: "boltform",
    templateId: "thumbs",
    authorName: "Nadia Ivanova",
    authorInitial: "N",
    thumbsUp: true,
    city: "Warsaw",
    country: "Poland",
    date: "2026-07-08",
    status: "published",
  },
  {
    id: "r27",
    siteId: "boltform",
    templateId: "thumbs",
    authorName: "Tom Bakker",
    authorInitial: "T",
    thumbsUp: false,
    comment: "Form felt a bit cramped on smaller screens.",
    city: "Rotterdam",
    country: "Netherlands",
    date: "2026-06-19",
    status: "pending",
  },
  {
    id: "r28",
    siteId: "boltform",
    templateId: "thumbs",
    authorName: "Lucia Rossi",
    authorInitial: "L",
    thumbsUp: true,
    city: "Barcelona",
    country: "Spain",
    date: "2026-06-04",
    status: "published",
  },
];

export function getSiteById(siteId: string): Site | undefined {
  return sites.find((site) => site.id === siteId);
}

export function getReviewsBySiteId(siteId: string): Review[] {
  return reviews.filter((review) => review.siteId === siteId);
}

export function getTotalReviewCount(): number {
  return reviews.length;
}

export function getTotalVisitCount(): number {
  return sites.reduce((total, site) => total + site.visitCount, 0);
}

/** Human-readable headline metric for a site, tailored to its mode/template. */
export function getSiteSummary(site: Site): string {
  if (site.mode === "analytics_only") {
    return `${site.visitCount.toLocaleString("en-US")} visits`;
  }

  const siteReviews = getReviewsBySiteId(site.id);

  switch (site.templateId) {
    case "star_rating":
    case "star_comment": {
      const rated = siteReviews.filter((r) => typeof r.rating === "number");
      const avg = rated.length
        ? rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length
        : 0;
      return `${avg.toFixed(1)} ★ avg`;
    }
    case "thumbs": {
      const up = siteReviews.filter((r) => r.thumbsUp).length;
      const pct = siteReviews.length ? Math.round((up / siteReviews.length) * 100) : 0;
      return `${pct}% positive`;
    }
    case "nps": {
      const scores = siteReviews.map((r) => r.npsScore ?? 0);
      const promoters = scores.filter((s) => s >= 9).length;
      const detractors = scores.filter((s) => s <= 6).length;
      const nps = scores.length
        ? Math.round(((promoters - detractors) / scores.length) * 100)
        : 0;
      return `NPS ${nps}`;
    }
    case "testimonial":
      return `${siteReviews.length} testimonials`;
    default:
      return "";
  }
}

export function getAverageRating(siteId: string): number {
  const siteReviews = getReviewsBySiteId(siteId).filter(
    (r) => typeof r.rating === "number",
  );
  if (siteReviews.length === 0) return 0;
  return siteReviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / siteReviews.length;
}

export function getOverallAverageRating(): number {
  const rated = reviews.filter((r) => typeof r.rating === "number");
  if (rated.length === 0) return 0;
  return rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length;
}

export type RatingBreakdownEntry = { label: string; count: number };

export function getRatingBreakdown(siteId: string): RatingBreakdownEntry[] {
  const site = getSiteById(siteId);
  if (!site || site.mode !== "reviews" || !site.templateId) return [];
  const siteReviews = getReviewsBySiteId(siteId);

  switch (site.templateId) {
    case "star_rating":
    case "star_comment":
      return [5, 4, 3, 2, 1].map((n) => ({
        label: `${n} star${n > 1 ? "s" : ""}`,
        count: siteReviews.filter((r) => r.rating === n).length,
      }));
    case "thumbs":
      return [
        { label: "Thumbs up", count: siteReviews.filter((r) => r.thumbsUp).length },
        { label: "Thumbs down", count: siteReviews.filter((r) => !r.thumbsUp).length },
      ];
    case "nps":
      return [
        {
          label: "Promoters (9–10)",
          count: siteReviews.filter((r) => (r.npsScore ?? 0) >= 9).length,
        },
        {
          label: "Passives (7–8)",
          count: siteReviews.filter(
            (r) => (r.npsScore ?? 0) >= 7 && (r.npsScore ?? 0) <= 8,
          ).length,
        },
        {
          label: "Detractors (0–6)",
          count: siteReviews.filter((r) => (r.npsScore ?? 0) <= 6).length,
        },
      ];
    case "testimonial":
      return [];
    default:
      return [];
  }
}

// ---------------------------------------------------------------------------
// Generated time-series stats (deterministic per site via seeded PRNG)
// ---------------------------------------------------------------------------

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  "United States": ["Austin", "San Francisco", "New York", "Seattle", "Chicago"],
  Germany: ["Berlin", "Munich", "Hamburg"],
  "United Kingdom": ["London", "Manchester", "Bristol"],
  Canada: ["Toronto", "Montreal", "Vancouver"],
  France: ["Paris", "Lyon"],
  Australia: ["Sydney", "Melbourne"],
  Netherlands: ["Amsterdam", "Rotterdam"],
  Brazil: ["São Paulo", "Rio de Janeiro"],
  India: ["Bangalore", "Mumbai"],
  Japan: ["Tokyo", "Osaka"],
  Ireland: ["Dublin"],
  Portugal: ["Lisbon", "Porto"],
  Sweden: ["Stockholm"],
  Spain: ["Madrid", "Barcelona"],
  Poland: ["Warsaw"],
};

const COUNTRY_POOL = Object.keys(CITIES_BY_COUNTRY);

/** Approximate coordinates used to place each country on the visitor map. */
export const countryCoordinates: Record<string, { lat: number; lon: number }> = {
  "United States": { lat: 39, lon: -98 },
  Germany: { lat: 52.5, lon: 13.4 },
  "United Kingdom": { lat: 51.5, lon: -0.1 },
  Canada: { lat: 50, lon: -85 },
  France: { lat: 48.9, lon: 2.3 },
  Australia: { lat: -33.9, lon: 151.2 },
  Netherlands: { lat: 52.4, lon: 4.9 },
  Brazil: { lat: -23.5, lon: -46.6 },
  India: { lat: 13, lon: 77.6 },
  Japan: { lat: 35.7, lon: 139.7 },
  Ireland: { lat: 53.3, lon: -6.3 },
  Portugal: { lat: 38.7, lon: -9.1 },
  Sweden: { lat: 59.3, lon: 18.1 },
  Spain: { lat: 40.4, lon: -3.7 },
  Poland: { lat: 52.2, lon: 21 },
};

function dateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function weightedPick<T>(rand: () => number, options: [T, number][]): T {
  const total = options.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rand() * total;
  for (const [value, weight] of options) {
    if (roll < weight) return value;
    roll -= weight;
  }
  return options[options.length - 1][0];
}

const DEVICE_WEIGHTS: [DeviceType, number][] = [
  ["Desktop", 55],
  ["Mobile", 40],
  ["Tablet", 5],
];

const OS_WEIGHTS: [OperatingSystem, number][] = [
  ["Windows", 34],
  ["macOS", 24],
  ["iOS", 20],
  ["Android", 17],
  ["Linux", 5],
];

const BROWSER_WEIGHTS: [Browser, number][] = [
  ["Chrome", 58],
  ["Safari", 22],
  ["Firefox", 10],
  ["Edge", 10],
];

const SOURCE_WEIGHTS: [TrafficSource, number][] = [
  ["Direct", 30],
  ["Google", 24],
  ["X / Twitter", 12],
  ["Product Hunt", 9],
  ["Hacker News", 8],
  ["Reddit", 7],
  ["LinkedIn", 6],
  ["GitHub", 4],
];

const PATH_WEIGHTS: [string, number][] = [
  ["/", 38],
  ["/pricing", 18],
  ["/docs", 15],
  ["/blog", 12],
  ["/changelog", 9],
  ["/about", 8],
];

/** Session length buckets in seconds — most visits are short, a few are long. */
const DURATION_BUCKETS: [[number, number], number][] = [
  [[3, 14], 22], // bounced
  [[15, 59], 28],
  [[60, 179], 26],
  [[180, 419], 16],
  [[420, 900], 8],
];

/** Visits cluster around working hours rather than spreading evenly. */
const HOUR_WEIGHTS: [number, number][] = Array.from({ length: 24 }, (_, hour) => {
  if (hour >= 9 && hour <= 17) return [hour, 8] as [number, number];
  if (hour >= 18 && hour <= 22) return [hour, 5] as [number, number];
  if (hour >= 6 && hour <= 8) return [hour, 4] as [number, number];
  return [hour, 1] as [number, number];
});

/** A visit under this many seconds counts as a bounce. */
export const BOUNCE_THRESHOLD_SECONDS = 15;

/** Sampled per-visit rows across the last `days` days — country/device/os/browser breakdown source. */
export function generateVisitStats(siteId: string, days = 30): VisitStat[] {
  const rand = mulberry32(hashString(siteId));
  const shuffled = [...COUNTRY_POOL].sort(() => rand() - 0.5);
  const activeCountries = shuffled.slice(0, 4 + Math.floor(rand() * 4));

  const visits: VisitStat[] = [];
  for (let dayOffset = days - 1; dayOffset >= 0; dayOffset--) {
    const dateStr = dateDaysAgo(dayOffset);
    const visitsToday = 3 + Math.floor(rand() * 12);
    for (let i = 0; i < visitsToday; i++) {
      const country = activeCountries[Math.floor(rand() * activeCountries.length)];
      const cities = CITIES_BY_COUNTRY[country];
      const city = cities[Math.floor(rand() * cities.length)];
      const [minSeconds, maxSeconds] = weightedPick(rand, DURATION_BUCKETS);

      visits.push({
        date: dateStr,
        country,
        city,
        device: weightedPick(rand, DEVICE_WEIGHTS),
        os: weightedPick(rand, OS_WEIGHTS),
        browser: weightedPick(rand, BROWSER_WEIGHTS),
        source: weightedPick(rand, SOURCE_WEIGHTS),
        path: weightedPick(rand, PATH_WEIGHTS),
        durationSeconds: minSeconds + Math.floor(rand() * (maxSeconds - minSeconds + 1)),
        hour: weightedPick(rand, HOUR_WEIGHTS),
        isNewVisitor: rand() < 0.62,
      });
    }
  }
  return visits;
}

export function getDailyVisitCounts(siteId: string, days = 30) {
  const counts = new Map<string, number>();
  for (const visit of generateVisitStats(siteId, days)) {
    counts.set(visit.date, (counts.get(visit.date) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([date, visits]) => ({ date, visits }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Sums daily visit counts across multiple sites — used for the dashboard overview chart. */
export function getAggregateDailyVisits(siteIds: string[], days = 30) {
  const totals = new Map<string, number>();
  for (const siteId of siteIds) {
    for (const point of getDailyVisitCounts(siteId, days)) {
      totals.set(point.date, (totals.get(point.date) ?? 0) + point.visits);
    }
  }
  return Array.from(totals.entries())
    .map(([date, visits]) => ({ date, visits }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getCountryBreakdown(siteId: string, days = 30) {
  const counts = new Map<string, number>();
  for (const visit of generateVisitStats(siteId, days)) {
    counts.set(visit.country, (counts.get(visit.country) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([country, visits]) => ({ country, visits }))
    .sort((a, b) => b.visits - a.visits);
}

function breakdownBy<K extends string>(
  siteId: string,
  days: number,
  key: (visit: VisitStat) => K,
): { label: K; count: number }[] {
  const counts = new Map<K, number>();
  for (const visit of generateVisitStats(siteId, days)) {
    const value = key(visit);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function getDeviceBreakdown(siteId: string, days = 30) {
  return breakdownBy(siteId, days, (visit) => visit.device);
}

export function getOsBreakdown(siteId: string, days = 30) {
  return breakdownBy(siteId, days, (visit) => visit.os);
}

export function getBrowserBreakdown(siteId: string, days = 30) {
  return breakdownBy(siteId, days, (visit) => visit.browser);
}

export function getSourceBreakdown(siteId: string, days = 30) {
  return breakdownBy(siteId, days, (visit) => visit.source);
}

export function getTopPages(siteId: string, days = 30) {
  return breakdownBy(siteId, days, (visit) => visit.path);
}

export function getVisitorTypeBreakdown(siteId: string, days = 30) {
  return breakdownBy(siteId, days, (visit) => (visit.isNewVisitor ? "New" : "Returning"));
}

/** Mean session length in seconds across the period. */
export function getAvgSessionDuration(siteId: string, days = 30): number {
  const visits = generateVisitStats(siteId, days);
  if (visits.length === 0) return 0;
  const total = visits.reduce((sum, visit) => sum + visit.durationSeconds, 0);
  return Math.round(total / visits.length);
}

/** Share of visits shorter than the bounce threshold, as a percentage. */
export function getBounceRate(siteId: string, days = 30): number {
  const visits = generateVisitStats(siteId, days);
  if (visits.length === 0) return 0;
  const bounced = visits.filter(
    (visit) => visit.durationSeconds < BOUNCE_THRESHOLD_SECONDS,
  ).length;
  return Math.round((bounced / visits.length) * 100);
}

/** Visit counts per hour of day, 0–23, ready for a bar chart. */
export function getHourlyDistribution(siteId: string, days = 30) {
  const counts = new Array<number>(24).fill(0);
  for (const visit of generateVisitStats(siteId, days)) {
    counts[visit.hour] += 1;
  }
  return counts.map((visits, hour) => ({ hour, visits }));
}

/** "45s" / "2m 34s" — compact enough for a stat card. */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`;
}

/** Merges several per-site breakdowns into one ranked list. */
function mergeBreakdowns(lists: { label: string; count: number }[][]) {
  const totals = new Map<string, number>();
  for (const list of lists) {
    for (const entry of list) {
      totals.set(entry.label, (totals.get(entry.label) ?? 0) + entry.count);
    }
  }
  return Array.from(totals.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function getAggregateCountryBreakdown(siteIds: string[], days = 30) {
  const totals = new Map<string, number>();
  for (const siteId of siteIds) {
    for (const entry of getCountryBreakdown(siteId, days)) {
      totals.set(entry.country, (totals.get(entry.country) ?? 0) + entry.visits);
    }
  }
  return Array.from(totals.entries())
    .map(([country, visits]) => ({ country, visits }))
    .sort((a, b) => b.visits - a.visits);
}

export function getAggregateDeviceBreakdown(siteIds: string[], days = 30) {
  return mergeBreakdowns(siteIds.map((id) => getDeviceBreakdown(id, days)));
}

export function getAggregateOsBreakdown(siteIds: string[], days = 30) {
  return mergeBreakdowns(siteIds.map((id) => getOsBreakdown(id, days)));
}

export function getAggregateBrowserBreakdown(siteIds: string[], days = 30) {
  return mergeBreakdowns(siteIds.map((id) => getBrowserBreakdown(id, days)));
}

export function getAggregateSourceBreakdown(siteIds: string[], days = 30) {
  return mergeBreakdowns(siteIds.map((id) => getSourceBreakdown(id, days)));
}

export function getAggregateTopPages(siteIds: string[], days = 30) {
  return mergeBreakdowns(siteIds.map((id) => getTopPages(id, days)));
}

export function getAggregateVisitorTypeBreakdown(siteIds: string[], days = 30) {
  return mergeBreakdowns(siteIds.map((id) => getVisitorTypeBreakdown(id, days)));
}

/** Visit-weighted mean session duration across sites. */
export function getAggregateAvgSessionDuration(siteIds: string[], days = 30): number {
  let totalSeconds = 0;
  let totalVisits = 0;
  for (const siteId of siteIds) {
    const visits = generateVisitStats(siteId, days);
    totalVisits += visits.length;
    totalSeconds += visits.reduce((sum, visit) => sum + visit.durationSeconds, 0);
  }
  return totalVisits === 0 ? 0 : Math.round(totalSeconds / totalVisits);
}

export function getAggregateBounceRate(siteIds: string[], days = 30): number {
  let bounced = 0;
  let totalVisits = 0;
  for (const siteId of siteIds) {
    const visits = generateVisitStats(siteId, days);
    totalVisits += visits.length;
    bounced += visits.filter(
      (visit) => visit.durationSeconds < BOUNCE_THRESHOLD_SECONDS,
    ).length;
  }
  return totalVisits === 0 ? 0 : Math.round((bounced / totalVisits) * 100);
}

export function getAggregateHourlyDistribution(siteIds: string[], days = 30) {
  const counts = new Array<number>(24).fill(0);
  for (const siteId of siteIds) {
    for (const entry of getHourlyDistribution(siteId, days)) {
      counts[entry.hour] += entry.visits;
    }
  }
  return counts.map((visits, hour) => ({ hour, visits }));
}

/** Free-plan review allowance, used by the sidebar usage meter. */
export const FREE_PLAN_REVIEW_LIMIT = 50;

/** Daily reviews + a template-appropriate rolling score, generated for the Stats tab. */
export function generateDailyMetrics(site: Site, days = 30): DailyMetric[] {
  const rand = mulberry32(hashString(`${site.id}-metrics`));

  const scoreRange: [number, number] =
    site.templateId === "nps"
      ? [0, 10]
      : site.templateId === "thumbs"
        ? [0, 100]
        : [1, 5];

  let trend =
    site.mode === "reviews"
      ? site.templateId === "nps"
        ? 7
        : site.templateId === "thumbs"
          ? 76
          : 4.4
      : 0;

  const jitterMagnitude =
    site.templateId === "nps" ? 1.1 : site.templateId === "thumbs" ? 6 : 0.35;

  const result: DailyMetric[] = [];
  for (let dayOffset = days - 1; dayOffset >= 0; dayOffset--) {
    const dateStr = dateDaysAgo(dayOffset);
    const reviewsToday =
      site.mode === "reviews" ? Math.floor(rand() * 6) : 0;

    if (site.mode === "reviews" && site.templateId !== "testimonial") {
      trend = clamp(trend + (rand() - 0.5) * jitterMagnitude, scoreRange[0], scoreRange[1]);
    }

    result.push({
      date: dateStr,
      reviews: reviewsToday,
      score: Number(trend.toFixed(1)),
    });
  }
  return result;
}

/** Sums daily reviews across multiple sites — used for the dashboard overview chart. */
export function getAggregateDailyReviews(reviewSites: Site[], days = 30) {
  const totals = new Map<string, number>();
  for (const site of reviewSites) {
    for (const point of generateDailyMetrics(site, days)) {
      totals.set(point.date, (totals.get(point.date) ?? 0) + point.reviews);
    }
  }
  return Array.from(totals.entries())
    .map(([date, reviews]) => ({ date, reviews }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export type PricingPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For indie projects just getting started with reviews or analytics.",
    features: [
      "1 site",
      "Reviews or analytics-only mode",
      "Up to 50 collected reviews",
      "Widget with Wizecatch badge",
      "30-day stats history",
      "Community support",
    ],
    cta: "Start for free",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For products that rely on social proof and visitor insight to grow.",
    features: [
      "Up to 10 sites",
      "Unlimited collected reviews",
      "Remove Wizecatch branding",
      "All 5 review templates",
      "Unlimited stats history",
      "CSV export",
      "Priority email support",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
];

// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------

export const account: Account = {
  name: "Alex Rivera",
  email: "alex@indiehacker.dev",
  initials: "AR",
  plan: "Free",
  joinedDate: "2025-11-02",
};

// ---------------------------------------------------------------------------
// Landing page — product testimonials, integrations, FAQ
// ---------------------------------------------------------------------------

export type ProductTestimonial = {
  id: string;
  authorName: string;
  authorRole: string;
  authorInitial: string;
  quote: string;
  rating?: number;
  featured?: boolean;
};

export const productTestimonials: ProductTestimonial[] = [
  {
    id: "pt1",
    authorName: "Maya Torres",
    authorRole: "Founder, Launchbase",
    authorInitial: "M",
    quote:
      "I've tried three review widgets before this one. Wizecatch is the first that didn't touch my Lighthouse score. Embedded it in under five minutes and never thought about it again.",
    rating: 5,
    featured: true,
  },
  {
    id: "pt2",
    authorName: "Jonas Weber",
    authorRole: "Indie developer",
    authorInitial: "J",
    quote: "One script tag. No dashboard sprawl. Exactly what I wanted.",
    rating: 5,
  },
  {
    id: "pt3",
    authorName: "Priya Nair",
    authorRole: "Co-founder, Formly",
    authorInitial: "P",
    quote:
      "Switching one of our sites to analytics-only mode took thirty seconds and didn't require touching a single line of the embed code — same script, different behavior.",
    rating: 5,
  },
  {
    id: "pt4",
    authorName: "Owen Clarke",
    authorRole: "Freelance developer",
    authorInitial: "O",
    quote: "The NPS template alone replaced a $40/mo tool I was using.",
    rating: 4,
  },
  {
    id: "pt5",
    authorName: "Sofia Almeida",
    authorRole: "Product designer",
    authorInitial: "S",
    quote:
      "Finally a widget that looks like it belongs on my site instead of screaming 'third-party embed'. The carousel format matches our brand almost perfectly out of the box.",
    rating: 5,
    featured: true,
  },
  {
    id: "pt6",
    authorName: "Ethan Park",
    authorRole: "Solo founder",
    authorInitial: "E",
    quote: "Set up analytics-only on my landing page before I'd even decided if I wanted reviews. No regrets.",
    rating: 4,
  },
  {
    id: "pt7",
    authorName: "Liam Fitzgerald",
    authorRole: "CTO, Devnotes",
    authorInitial: "L",
    quote:
      "We collect NPS scores after every release now. Detractors route straight to our support inbox, promoters become testimonials. It's the workflow we always meant to build ourselves.",
    rating: 5,
  },
  {
    id: "pt8",
    authorName: "Hannah Kim",
    authorRole: "Indie hacker",
    authorInitial: "H",
    quote: "Country breakdown on the free plan is honestly better than tools I've paid for.",
    rating: 5,
  },
  {
    id: "pt9",
    authorName: "Camille Laurent",
    authorRole: "Founder, Pixeldeck",
    authorInitial: "C",
    quote: "No rating pressure with the testimonial template — just honest quotes from real customers.",
    rating: 5,
  },
];

export type Integration = {
  name: string;
};

export const integrations: Integration[] = [
  { name: "Next.js" },
  { name: "WordPress" },
  { name: "Webflow" },
  { name: "Shopify" },
  { name: "Framer" },
  { name: "Squarespace" },
  { name: "Astro" },
  { name: "Plain HTML" },
];

export type FaqEntry = {
  question: string;
  answer: string;
};

export const faqs: FaqEntry[] = [
  {
    question: "Will Wizecatch slow down my site?",
    answer:
      "No. The script is a few kilobytes, loads asynchronously, and never blocks rendering. In analytics-only mode there's no visible UI at all, so there's nothing to paint.",
  },
  {
    question: "Can I use it with a no-code builder like Webflow or Framer?",
    answer:
      "Yes. Since it's a single script tag, it works anywhere you can paste custom HTML — Webflow, Framer, Squarespace, Carrd, Notion sites, and plain HTML pages all work the same way.",
  },
  {
    question: "What happens when I hit 50 reviews on the Free plan?",
    answer:
      "Your widget keeps working and continues showing your existing reviews. New submissions are queued until you upgrade to Pro, so you never lose a review — you just won't see new ones publish until you upgrade.",
  },
  {
    question: "Can I switch a site from Analytics-only to Reviews mode later?",
    answer:
      "Yes, at any time from the site's settings. Your visit history stays intact either way — switching modes only changes whether a review template is shown to visitors going forward.",
  },
  {
    question: "Do you store visitor IP addresses?",
    answer:
      "We resolve country and city from the request at collection time and don't retain the raw IP address afterward. Visit stats are aggregated, not tied to an individual identity.",
  },
  {
    question: "Can I export my reviews and stats?",
    answer:
      "CSV export for reviews and stats is available on the Pro plan. Free plan data is fully yours too — just not bulk-exportable without upgrading.",
  },
  {
    question: "Do I need a backend or database to use Wizecatch?",
    answer:
      "No. Wizecatch runs entirely as a hosted service — you embed the script, we handle collection, storage, and the dashboard. Nothing to deploy or maintain on your side.",
  },
];
