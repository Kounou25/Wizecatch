export type Locale = "en" | "fr";

export const locales: Locale[] = ["en", "fr"];

const en = {
  nav: {
    howItWorks: "How it works",
    pricing: "Pricing",
    login: "Log in",
    getStarted: "Get started free",
  },
  sidebar: {
    dashboard: "Overview",
    settings: "Settings",
    logout: "Log out",
    sites: "Sites",
    reviews: "Reviews",
    analytics: "Analytics",
    groupMain: "Workspace",
    groupAccount: "Account",
    addSite: "New site",
    planUsage: "{used} of {limit} reviews",
    freePlan: "Free plan",
    upgrade: "Upgrade",
    help: "Help & docs",
  },
  sitesPage: {
    title: "Sites",
    subtitle: "Every site connected to your workspace.",
    all: "All modes",
    empty: "No sites yet",
    emptyDesc: "Add your first site to get an embed script and start collecting data.",
  },
  reviewsPage: {
    title: "Reviews",
    subtitle: "Every review collected across your sites.",
    allSites: "All sites",
    empty: "No reviews yet",
    emptyDesc: "Reviews collected from your sites will appear here.",
    noMatch: "No reviews match your filters",
    noMatchDesc: "Try changing the site or status filter.",
  },
  analyticsPage: {
    title: "Analytics",
    subtitle: "Combined visitor data across all your sites.",
  },
  hero: {
    badge: "No coding required",
    titlePart1: "Know who visits.",
    titleHighlight: "Show what they say.",
    subtitle:
      "One line of code — copy, paste, done — gives you visitor analytics and a customer review widget. Nothing to build, nothing to maintain, no cookie banner to add.",
    ctaPrimary: "Start free",
    ctaSecondary: "See how it works",
    socialProof:
      "Join {users} people like you who have already collected {reviews} reviews with Wizecatch.",
    socialProofSoft:
      "Used by freelancers, agencies and online stores to turn quiet visitors into public proof.",
    trust1: "Free forever for your first site",
    trust2: "No cookie banner required",
    trust3: "Installs in under 2 minutes",
    liveLabel: "Live",
  },
  problem: {
    eyebrow: "Sound familiar?",
    title: "You shipped it. Now you're flying blind.",
    subtitle:
      "Whether you write code or not, everyone with a website hits the same two walls after launch.",
    p1Title: "Is anyone even out there?",
    p1Desc:
      "You put your site online last week. Traffic could be 12 people or 1,200 — you genuinely don't know. And the usual analytics tools mean adding a cookie banner, then watching visitors bounce off it, for numbers you'll look at twice.",
    p2Title: "Your best reviews are stuck in your inbox",
    p2Desc:
      "Customers tell you they love it — by email, on WhatsApp, in person at the counter. None of it reaches the one place it would actually convince someone: your website.",
    p3Title: "Building it yourself isn't realistic",
    p3Desc:
      "A form, a database, moderation, spam filtering. Either you lose a week to it, or you wait on a developer's quote and a two-month slot. Neither gets reviews on your site this month.",
    p4Title: "Or you pay for two separate tools",
    p4Desc:
      "One for analytics, one for testimonials. Two dashboards, two subscriptions, two setups to figure out — and both of them slowing down the site you're trying to grow.",
  },
  howItWorks: {
    eyebrow: "The fix",
    title: "One script. Four minutes. Done.",
    step1Title: "Add your site",
    step1Desc:
      "Paste your domain and pick what you need: collect reviews, or measure traffic silently. You can switch later without touching the code.",
    step2Title: "Copy one line into your site",
    step2Desc:
      "We generate the exact snippet and show you where it goes — whether you're on Shopify, WordPress, Webflow, Squarespace, or a site someone built for you.",
    step3Title: "Watch it fill up",
    step3Desc:
      "Visits appear within seconds. Reviews land in your dashboard, and nothing goes public until you approve it.",
  },
  templatesSection: {
    eyebrow: "Ask the right way",
    title: "A long form is wrong for half your pages",
    subtitle:
      "Asking someone to write a paragraph right after checkout kills your response rate. Pick what fits the moment — one tap, one score, or a full quote.",
    analyticsBadge: "Nothing shown to visitors",
    analyticsTitle: "Or ask nothing at all",
    analyticsDesc:
      "Not every site needs reviews. In analytics-only mode the script measures traffic in complete silence — no popup, no prompt, and the review interface is never even downloaded.",
    previewLabel: "Live preview",
    hint: "This is the real widget — click the fields to try it.",
  },
  statsPreview: {
    eyebrow: "Not just stars",
    title: "Reviews tell you what. Analytics tell you why.",
    subtitle:
      "A 3-star review means more when you can see it came from mobile users in Brazil who left after 8 seconds. Same script tag, same dashboard, no extra kilobyte.",
  },
  trustedBy: {
    label: "Powering sites like",
  },
  wallOfLove: {
    eyebrow: "Wall of love",
    title: "What our users say about Wizecatch",
    subtitle:
      "Every quote below was collected with Wizecatch and published in one click. This wall is the product.",
  },
  integrations: {
    eyebrow: "Works everywhere",
    title: "If you can copy and paste, you're done",
    subtitle:
      "No plugin to install, no account to connect, no technical setup. It works the same on a store, a portfolio, or a site you built yourself.",
  },
  faq: {
    eyebrow: "FAQ",
    title: "The questions you're already asking",
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Free until it actually matters",
    subtitle:
      "Your first site is free forever — not a trial. Upgrade the day your reviews start closing deals for you.",
    monthly: "Monthly",
    yearly: "Yearly",
    saveBadge: "2 months free",
    perMonth: "/month",
    billedYearly: "billed yearly",
    anchorHint: "Price when billed monthly",
    limitsLabel: "Limits",
    reassure1: "No credit card to start",
    reassure2: "Cancel in one click",
    reassure3: "Your data stays yours",
    once: "once",
    soon: "Soon",
    spots: "Limited to {count} spots",
    mostPopular: "Most popular",
    plans: {
      free: {
        name: "Free",
        tagline: "See if anyone's out there",
        description:
          "Enough to answer one question: is my site getting visitors, and do they like it?",
        features: [
          "1 website",
          "2,500 visits per month",
          "Up to 20 reviews",
          "Star rating & thumbs up/down",
          "Visits and countries",
          "30 days of history",
        ],
        limits: [
          "Wizecatch badge on your widget",
          "Your wall shows 3 reviews max",
          "No devices, sources or pages",
          "Community support",
        ],
        comingSoon: [] as string[],
        cta: "Start free",
      },
      starter: {
        name: "Starter",
        tagline: "Make it look like yours",
        description:
          "Take our name off your widget, stop counting reviews, and unlock the full dashboard.",
        features: [
          "3 websites",
          "10,000 visits per month",
          "Unlimited reviews",
          "All 5 review formats",
          "Full analytics dashboard",
          "Remove the Wizecatch badge",
          "Export your data to CSV",
          "12 months of history",
          "Email support",
        ],
        limits: [
          "10,000 visits across all your sites",
          "Anything past 12 months is dropped",
        ],
        comingSoon: [] as string[],
        cta: "Upgrade to Starter",
      },
      scale: {
        name: "Scale",
        tagline: "For growth and agencies",
        description:
          "When one site becomes ten, and you need history that never gets cut.",
        features: [
          "25 websites",
          "500,000 visits per month",
          "Everything in Starter",
          "History that never expires",
          "All sites in one combined dashboard",
          "Priority support",
        ],
        limits: ["Beyond 25 websites, talk to us"],
        comingSoon: [] as string[],
        cta: "Upgrade to Scale",
      },
    },
    lifetimeCard: {
      name: "Founding Lifetime",
      tagline: "Pay once. Never again.",
      description:
        "For a site that's up and running and won't triple overnight. One payment, and it's yours for good — no renewal, no price increase, ever.",
      features: [
        "5 websites",
        "25,000 visits per month",
        "Everything in Starter",
        "12 months of rolling history",
        "Every future update included",
      ],
      cta: "Claim a founding spot",
    },
  },
  finalCta: {
    title: "Stop guessing. Start showing.",
    subtitle:
      "Two minutes to install. Free forever for your first site. No credit card, no cookie banner, no backend to babysit.",
    cta: "Start free",
  },
  footer: {
    tagline: "Know who visits. Show what they say. One script.",
    rights: "All rights reserved.",
  },
  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Log in to your Wizecatch account",
    signupTitle: "Create your account",
    signupSubtitle: "Start collecting data in minutes",
    email: "Email",
    password: "Password",
    fullName: "Full name",
    continueGoogle: "Continue with Google",
    orContinueEmail: "or continue with email",
    forgotPassword: "Forgot password?",
    loginButton: "Log in",
    signupButton: "Create account",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    signupLink: "Sign up",
    loginLink: "Log in",
    terms: "By signing up, you agree to Wizecatch's Terms of Service and Privacy Policy.",
  },
  dashboard: {
    welcome: "Welcome back, {name}",
    subtitle: "Here's what's happening across your sites.",
    addNewSite: "Add a new site",
    yourSites: "Your sites",
    totalSites: "Total sites",
    totalReviews: "Total reviews",
    totalVisits: "Total visits",
    visitsChart: "Visits across all sites (30 days)",
    reviewsChart: "Reviews collected (30 days)",
    visitsBySite: "Visits by site",
    noReviewSites: "No sites in Reviews mode yet.",
  },
  siteCard: {
    reviewsMode: "Reviews",
    analyticsMode: "Analytics only",
  },
  wizard: {
    backToDashboard: "Back to dashboard",
    title: "Add a new site",
    subtitle: "Create a site to get a unique embed script.",
    stepLabel: "Step {current} of {total}",
    step1Title: "Site details",
    step1Desc: "Give your site a name and domain.",
    siteName: "Site name",
    siteNamePlaceholder: "Launchbase",
    domain: "Domain",
    domainPlaceholder: "launchbase.app",
    domainHint: "Don't include https:// — just the bare domain.",
    step2Title: "Choose a mode",
    step2Desc: "This can be changed later from the site settings.",
    reviewsModeTitle: "Collect reviews",
    reviewsModeDesc:
      "Show a popup or form to visitors and collect ratings, testimonials, or feedback.",
    analyticsModeTitle: "Track visits only",
    analyticsModeDesc:
      "No popup shown to visitors. The script silently tracks visits by country and city.",
    step3Title: "Pick a review template",
    step3Desc: "Choose the format visitors will use to leave feedback.",
    back: "Back",
    next: "Next",
    createSite: "Create site",
    cancel: "Cancel",
  },
  siteDetail: {
    backToSites: "Back to all sites",
    active: "Active",
    visits: "Visits",
    avgRating: "Average rating",
    tabs: {
      overview: "Overview",
      stats: "Stats",
      reviews: "Reviews",
      templateSettings: "Template settings",
      widgetSettings: "Widget settings",
    },
    embedScript: "Embed script",
    embedScriptDesc: "Paste this snippet before the closing </body> tag.",
    wallTitle: "Display your reviews",
    wallDesc: "Paste this anywhere on your page — published reviews will appear there.",
    wallHint:
      "Only published reviews are shown. The layout follows the format set in Widget settings.",
    embedBothDesc:
      "Add the script once, then place the wall tag wherever you want your reviews to appear.",
    wordpressTitle: "Using WordPress?",
    wordpressDesc:
      "Download a plugin with your site key already set. Upload, activate, done — no code to paste, and nothing lost when your theme updates.",
    wordpressCta: "Download plugin",
    wordpressHint:
      "In the plugin settings you can collect statistics only, without showing the review form. Your reviews are never displayed until you add the [wizecatch_wall] shortcode to a page.",
    wordpressManual: "Or add the script by hand:",
    modeLabel: "Mode",
    templateLabel: "Template",
    notFoundTitle: "Site not found",
    notFoundDesc: "We couldn't find a site with that ID. It may have been removed.",
  },
  stats: {
    noData: "No data yet",
    exportReviews: "Export reviews",
    exportVisits: "Export visits",
    exportPending: "Preparing…",
    exportUpgrade: "Available on paid plans",
    exportFailed: "Export failed, try again",
    period7: "7 days",
    period30: "30 days",
    period90: "90 days",
    vsPrevious: "vs previous period",
    newMetric: "new",
    uniqueVisitors: "Unique visitors",
    pageviews: "Page views",
    cities: "Top cities",
    languages: "Languages",
    entryPages: "Entry pages",
    topPagesReal: "Most viewed pages",
    utmSources: "Campaign sources",
    utmCampaigns: "Campaigns",
    npsTitle: "Net Promoter Score",
    npsPromoters: "Promoters",
    npsPassives: "Passives",
    npsDetractors: "Detractors",
    npsResponses: "{count} responses",
    collectionRate: "Review collection rate",
    collectionRateDesc: "Reviews per 100 unique visitors",
    ratingByCountry: "Satisfaction by country",
    ratingByDevice: "Satisfaction by device",
    ratingTrend: "Average rating over time",
    reviewsCollected: "Reviews collected",
    ratingCrossHint: "Where your visitors are happiest — and where they are not.",
    visitsOverTime: "Visits over the last 30 days",
    scoreOverTime: "Score trend over the last 30 days",
    ratingBreakdown: "Rating breakdown",
    countryBreakdown: "Visitors by country",
    countriesReached: "Countries reached",
    noRatingData: "This template doesn't collect a numeric score.",
    visitorMap: "Visitor map",
    device: "Device",
    os: "Operating system",
    browser: "Browser",
    avgDuration: "Avg. time on site",
    bounceRate: "Bounce rate",
    sources: "Traffic sources",
    topPages: "Top pages",
    visitorType: "New vs returning",
    hourly: "Visits by hour of day",
    newVisitors: "New visitors",
  },
  reviewsTab: {
    allRatings: "All ratings",
    allStatuses: "All statuses",
    published: "Published",
    pending: "Pending",
    hidden: "Hidden",
    noReviews: "No reviews yet",
    noReviewsDesc: "Once your widget is live, reviews collected from this site will show up here.",
    noMatch: "No reviews match your filters",
    noMatchDesc: "Try adjusting the rating or status filters to see more reviews.",
    clearFilters: "Clear filters",
  },
  templateSettingsTab: {
    activeTemplate: "Active template",
    changeTemplate: "Change template",
    preview: "Live preview",
    selectTemplate: "Select a template",
    content: "Content",
    contentDesc: "Customize the text visitors see on the widget.",
    titleLabel: "Prompt title",
    buttonLabel: "Button label",
    behavior: "Behavior",
  },
  widgetSettingsTab: {
    title: "Widget settings",
    description: "Control how the widget appears on {domain}.",
    position: "Position",
    trigger: "Trigger",
    format: "Display format",
    save: "Save changes",
    formSection: "Review collection form",
    formSectionDesc: "The prompt shown to visitors so they can leave a review.",
    wallSection: "Reviews wall",
    wallSectionDesc:
      "How published reviews are laid out inside your <div data-wizecatch-wall> tag.",
    preview: "Preview",
  },
  settings: {
    title: "Settings",
    subtitle: "Manage your account and subscription.",
    profile: "Profile",
    memberSince: "Member since {date}",
    fullName: "Full name",
    email: "Email",
    saveChanges: "Save changes",
    subscription: "Subscription",
    freePlanDesc: "You're on the Free plan — 1 site, up to 50 collected reviews.",
    proPlanDesc: "You're on the Pro plan with unlimited reviews across up to 10 sites.",
    upgradeToPro: "Upgrade to Pro",
    language: "Language",
    languageDesc: "Choose the interface language.",
    session: "Session",
    sessionDesc: "Sign out of Wizecatch on this device.",
    logOut: "Log out",
  },
  common: {
    saved: "Saved",
    copy: "Copy",
    copied: "Copied",
  },

  /** Les 5 formats d'avis, indexés par identifiant. */
  templates: {
    star_rating: {
      name: "Star Rating",
      description:
        "A simple 1–5 star rating. Fastest way for visitors to leave feedback.",
    },
    star_comment: {
      name: "Star Rating + Comment",
      description:
        "Star rating paired with an optional written comment for more context.",
    },
    thumbs: {
      name: "Thumbs Up / Down",
      description: "A single-tap like or dislike — the lowest-friction option available.",
    },
    nps: {
      name: "NPS Score",
      description: "0–10 likelihood-to-recommend score with an optional comment.",
    },
    testimonial: {
      name: "Testimonial",
      description: "Open-ended name and text testimonial, no rating attached.",
    },
  },

  widgetOptions: {
    positions: {
      "bottom-right": "Bottom right",
      "bottom-left": "Bottom left",
      "top-right": "Top right",
      "top-left": "Top left",
      inline: "Inline (embedded in page)",
    },
    triggers: {
      load: "On page load",
      scroll: "On scroll into view",
      delay: "After a 5s delay",
    },
    formats: {
      carousel: "Carousel",
      grid: "Grid",
      list: "List",
      popup: "Popup card",
    },
  },

  reviewStatus: {
    published: "Published",
    pending: "Pending",
    hidden: "Hidden",
  },

  states: {
    noVisits: "No visits yet",
    noVisitsDesc:
      "Once the script is live on your site, visits will appear here within seconds.",
    noVisitsNoSite: "Add a site and embed the script to start collecting data.",
    statsError: "Could not load statistics",
    statsErrorDesc:
      "Something went wrong while fetching your data. Try reloading the page.",
    requireComment: "Require a comment",
    requireCommentDesc: "Visitors must write something before submitting.",
    showLocation: "Show reviewer location",
    showLocationDesc: "Display city and country next to published reviews.",
    anonymous: "Anonymous",
  },

  faqItems: [
    {
      question: "Will Wizecatch slow down my site?",
      answer:
        "No. The script is a few kilobytes, loads asynchronously, and never blocks rendering. In analytics-only mode there's no visible UI at all, so there's nothing to paint.",
    },
    {
      question: "Can I use it with a no-code builder like Webflow or Framer?",
      answer:
        "Yes. Since it's a single script tag, it works anywhere you can paste custom HTML — Webflow, Framer, Squarespace, Shopify, Carrd and plain HTML pages all work the same way.",
    },
    {
      question: "What happens when I hit the review limit on the Free plan?",
      answer:
        "Your widget keeps working and continues showing your existing reviews. New submissions are queued until you upgrade, so you never lose a review — you just won't see new ones publish until then.",
    },
    {
      question: "Can I switch a site from Analytics-only to Reviews mode later?",
      answer:
        "Yes, at any time from the site's settings. Your visit history stays intact either way — switching modes only changes whether a review form is shown to visitors going forward.",
    },
    {
      question: "Do you store visitor IP addresses?",
      answer:
        "We resolve country and city from the request at collection time and don't retain the raw IP address afterward. Visit stats are aggregated, not tied to an individual identity — which is why you don't need a cookie banner.",
    },
    {
      question: "What happens to my reviews if I stop paying?",
      answer:
        "Nothing is deleted. Your account drops back to the Free limits, so older history stops showing and the badge comes back — but every review you collected stays in your dashboard, and the ones you published stay live on your site.",
    },
    {
      question: "Do I need a backend or a database to use Wizecatch?",
      answer:
        "No. Wizecatch runs entirely as a hosted service — you paste the script, we handle collection, storage and the dashboard. Nothing to deploy or maintain on your side.",
    },
  ],

  /** Rôles et citations du mur d'avis, indexés par identifiant. */
  testimonials: {
    pt1: {
      role: "Founder, Launchbase",
      quote:
        "I've tried three review widgets before this one. Wizecatch is the first that didn't touch my page speed. Embedded it in under five minutes and never thought about it again.",
    },
    pt2: {
      role: "Online store owner",
      quote:
        "I don't code. I pasted one line into Shopify and it worked. That's genuinely all it was.",
    },
    pt3: {
      role: "Co-founder, Formly",
      quote:
        "Switching one of our sites to analytics-only mode took thirty seconds and didn't require touching a single line of the embed code — same script, different behavior.",
    },
    pt4: {
      role: "Marketing lead",
      quote: "Replaced two subscriptions with one. Nobody had to involve our dev team.",
    },
    pt5: {
      role: "Product designer",
      quote:
        "Finally a widget that looks like it belongs on my site instead of screaming 'third-party embed'. The carousel matches our brand almost perfectly out of the box.",
    },
    pt6: {
      role: "Yoga studio owner",
      quote:
        "I just wanted to know if my new site was getting visits. Turns out it was — and now I collect reviews from it too.",
    },
    pt7: {
      role: "CTO, Devnotes",
      quote:
        "We collect NPS scores after every release now. Detractors route straight to our support inbox, promoters become testimonials. It's the workflow we always meant to build ourselves.",
    },
    pt8: {
      role: "Agency owner",
      quote:
        "We set it up on every client site now. They get their own reviews page without ever calling us.",
    },
    pt9: {
      role: "Founder, Pixeldeck",
      quote:
        "No rating pressure with the testimonial format — just honest quotes from real customers.",
    },
  },
};

export type Dictionary = typeof en;

const fr: Dictionary = {
  nav: {
    howItWorks: "Fonctionnement",
    pricing: "Tarifs",
    login: "Connexion",
    getStarted: "Commencer gratuitement",
  },
  sidebar: {
    dashboard: "Vue d'ensemble",
    settings: "Paramètres",
    logout: "Se déconnecter",
    sites: "Sites",
    reviews: "Avis",
    analytics: "Statistiques",
    groupMain: "Espace de travail",
    groupAccount: "Compte",
    addSite: "Nouveau site",
    planUsage: "{used} avis sur {limit}",
    freePlan: "Offre gratuite",
    upgrade: "Passer à Pro",
    help: "Aide & docs",
  },
  sitesPage: {
    title: "Sites",
    subtitle: "Tous les sites connectés à votre espace de travail.",
    all: "Tous les modes",
    empty: "Aucun site pour l'instant",
    emptyDesc:
      "Ajoutez votre premier site pour obtenir un script d'intégration et commencer à collecter des données.",
  },
  reviewsPage: {
    title: "Avis",
    subtitle: "Tous les avis collectés sur vos sites.",
    allSites: "Tous les sites",
    empty: "Aucun avis pour l'instant",
    emptyDesc: "Les avis collectés sur vos sites apparaîtront ici.",
    noMatch: "Aucun avis ne correspond à vos filtres",
    noMatchDesc: "Essayez de changer le filtre de site ou de statut.",
  },
  analyticsPage: {
    title: "Statistiques",
    subtitle: "Données de visite combinées sur tous vos sites.",
  },
  hero: {
    badge: "Aucune compétence technique requise",
    titlePart1: "Sachez qui vous visite.",
    titleHighlight: "Montrez ce qu'ils en disent.",
    subtitle:
      "Une ligne de code — copier, coller, c'est fait — vous donne vos statistiques de visite et un widget d'avis clients. Rien à construire, rien à maintenir, aucun bandeau cookies à ajouter.",
    ctaPrimary: "Commencer gratuitement",
    ctaSecondary: "Voir comment ça marche",
    socialProof:
      "Rejoignez {users} personnes comme vous qui ont déjà collecté {reviews} avis avec Wizecatch.",
    socialProofSoft:
      "Utilisé par des indépendants, des agences et des boutiques en ligne pour transformer des visiteurs discrets en preuves publiques.",
    trust1: "Gratuit à vie pour votre premier site",
    trust2: "Aucun bandeau cookies nécessaire",
    trust3: "Installé en moins de 2 minutes",
    liveLabel: "En direct",
  },
  problem: {
    eyebrow: "Ça vous parle ?",
    title: "Vous avez livré. Et maintenant vous naviguez à l'aveugle.",
    subtitle:
      "Que vous codiez ou non, toute personne qui a un site se heurte aux deux mêmes murs après la mise en ligne.",
    p1Title: "Est-ce qu'il y a seulement quelqu'un ?",
    p1Desc:
      "Vous avez mis votre site en ligne la semaine dernière. Le trafic, c'est peut-être 12 personnes, peut-être 1 200 — vous n'en savez honnêtement rien. Et les outils habituels imposent un bandeau cookies, qui fait fuir vos visiteurs, pour des chiffres que vous regarderez deux fois.",
    p2Title: "Vos meilleurs avis dorment dans votre boîte mail",
    p2Desc:
      "Vos clients vous disent qu'ils adorent — par email, sur WhatsApp, de vive voix au comptoir. Rien de tout ça n'arrive au seul endroit qui convaincrait vraiment quelqu'un : votre site.",
    p3Title: "Le faire vous-même n'est pas réaliste",
    p3Desc:
      "Un formulaire, une base de données, la modération, le filtrage du spam. Soit vous y perdez une semaine, soit vous attendez le devis d'un développeur et un créneau dans deux mois. Dans les deux cas, vos avis ne seront pas en ligne ce mois-ci.",
    p4Title: "Ou vous payez deux outils séparés",
    p4Desc:
      "Un pour les statistiques, un pour les témoignages. Deux tableaux de bord, deux abonnements, deux installations à comprendre — et tous les deux ralentissent le site que vous essayez de faire décoller.",
  },
  howItWorks: {
    eyebrow: "La solution",
    title: "Un script. Quatre minutes. C'est tout.",
    step1Title: "Ajoutez votre site",
    step1Desc:
      "Renseignez votre domaine et choisissez ce dont vous avez besoin : collecter des avis, ou mesurer le trafic en silence. Vous pourrez changer d'avis sans toucher au code.",
    step2Title: "Copiez une ligne dans votre site",
    step2Desc:
      "Nous générons le code exact et vous montrons où le coller — que vous soyez sur Shopify, WordPress, Webflow, Squarespace, ou un site créé pour vous.",
    step3Title: "Regardez ça se remplir",
    step3Desc:
      "Les visites apparaissent en quelques secondes. Les avis arrivent dans votre tableau de bord, et rien n'est publié tant que vous ne l'avez pas validé.",
  },
  templatesSection: {
    eyebrow: "Demandez de la bonne façon",
    title: "Un formulaire long est inadapté à la moitié de vos pages",
    subtitle:
      "Demander à quelqu'un d'écrire un paragraphe juste après son achat tue votre taux de réponse. Choisissez ce qui colle au moment — un clic, une note, ou une citation complète.",
    analyticsBadge: "Rien d'affiché aux visiteurs",
    analyticsTitle: "Ou ne demandez rien du tout",
    analyticsDesc:
      "Tous les sites n'ont pas besoin d'avis. En mode analytics uniquement, le script mesure le trafic en silence total — aucun popup, aucune sollicitation, et le code d'interface n'est même jamais téléchargé.",
    previewLabel: "Aperçu en direct",
    hint: "C'est le vrai widget — cliquez dans les champs pour l'essayer.",
  },
  statsPreview: {
    eyebrow: "Pas que des étoiles",
    title: "Les avis disent quoi. Les stats disent pourquoi.",
    subtitle:
      "Un avis 3 étoiles prend un tout autre sens quand vous voyez qu'il vient de visiteurs mobiles au Brésil, partis au bout de 8 secondes. Même balise script, même tableau de bord, pas un kilo-octet de plus.",
  },
  trustedBy: {
    label: "Utilisé sur des sites comme",
  },
  wallOfLove: {
    eyebrow: "Mur d'amour",
    title: "Ce que nos utilisateurs disent de Wizecatch",
    subtitle:
      "Chaque citation ci-dessous a été collectée avec Wizecatch et publiée en un clic. Ce mur, c'est le produit.",
  },
  integrations: {
    eyebrow: "Partout",
    title: "Si vous savez copier-coller, c'est déjà fini",
    subtitle:
      "Aucun plugin à installer, aucun compte à connecter, aucune configuration technique. Ça marche pareil sur une boutique, un portfolio, ou un site que vous avez créé vous-même.",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Les questions que vous vous posez déjà",
  },
  pricing: {
    eyebrow: "Tarifs",
    title: "Gratuit tant que ça ne compte pas vraiment",
    subtitle:
      "Votre premier site est gratuit à vie — ce n'est pas un essai. Passez à Pro le jour où vos avis commencent à conclure des ventes à votre place.",
    monthly: "Mensuel",
    yearly: "Annuel",
    saveBadge: "2 mois offerts",
    perMonth: "/mois",
    billedYearly: "facturés à l'année",
    anchorHint: "Tarif en paiement mensuel",
    limitsLabel: "Limites",
    reassure1: "Sans carte bancaire pour commencer",
    reassure2: "Résiliation en un clic",
    reassure3: "Vos données restent les vôtres",
    once: "une fois",
    soon: "Bientôt",
    spots: "Limité à {count} places",
    mostPopular: "Le plus choisi",
    plans: {
      free: {
        name: "Gratuit",
        tagline: "Voyez s'il y a du monde",
        description:
          "De quoi répondre à une seule question : mon site reçoit-il des visiteurs, et est-ce qu'ils apprécient ?",
        features: [
          "1 site",
          "2 500 visites par mois",
          "Jusqu'à 20 avis",
          "Note en étoiles & pouce haut/bas",
          "Visites et pays",
          "30 jours d'historique",
        ],
        limits: [
          "Badge Wizecatch sur votre widget",
          "Votre mur affiche 3 avis maximum",
          "Ni appareils, ni sources, ni pages",
          "Support communautaire",
        ],
        comingSoon: [] as string[],
        cta: "Commencer gratuitement",
      },
      starter: {
        name: "Starter",
        tagline: "Faites-le vôtre",
        description:
          "Retirez notre nom de votre widget, arrêtez de compter vos avis, et débloquez le tableau de bord complet.",
        features: [
          "3 sites",
          "10 000 visites par mois",
          "Avis illimités",
          "Les 5 formats d'avis",
          "Tableau de bord complet",
          "Badge Wizecatch retiré",
          "Export de vos données en CSV",
          "12 mois d'historique",
          "Support par email",
        ],
        limits: [
          "10 000 visites tous sites confondus",
          "Au-delà de 12 mois, les données sont effacées",
        ],
        comingSoon: [] as string[],
        cta: "Passer à Starter",
      },
      scale: {
        name: "Scale",
        tagline: "Pour la croissance et les agences",
        description:
          "Quand un site devient dix, et qu'il vous faut un historique qui ne se coupe jamais.",
        features: [
          "25 sites",
          "500 000 visites par mois",
          "Tout Starter",
          "Historique conservé indéfiniment",
          "Tous vos sites dans un tableau de bord unique",
          "Support prioritaire",
        ],
        limits: ["Au-delà de 25 sites, parlons-en"],
        comingSoon: [] as string[],
        cta: "Passer à Scale",
      },
    },
    lifetimeCard: {
      name: "Offre Fondateur à vie",
      tagline: "Payez une fois. Plus jamais.",
      description:
        "Pour un site déjà lancé et dont le trafic ne va pas tripler du jour au lendemain. Un seul paiement, et c'est à vous pour de bon — sans renouvellement, sans hausse de prix, jamais.",
      features: [
        "5 sites",
        "25 000 visites par mois",
        "Tout Starter",
        "12 mois d'historique glissant",
        "Toutes les mises à jour futures incluses",
      ],
      cta: "Réserver une place fondateur",
    },
  },
  finalCta: {
    title: "Arrêtez de deviner. Commencez à montrer.",
    subtitle:
      "Deux minutes pour l'installer. Gratuit à vie pour votre premier site. Sans carte bancaire, sans bandeau cookies, sans backend à surveiller.",
    cta: "Commencer gratuitement",
  },
  footer: {
    tagline: "Sachez qui vous visite. Montrez ce qu'ils en disent. Un seul script.",
    rights: "Tous droits réservés.",
  },
  auth: {
    loginTitle: "Content de vous revoir",
    loginSubtitle: "Connectez-vous à votre compte Wizecatch",
    signupTitle: "Créez votre compte",
    signupSubtitle: "Commencez à collecter des données en quelques minutes",
    email: "Email",
    password: "Mot de passe",
    fullName: "Nom complet",
    continueGoogle: "Continuer avec Google",
    orContinueEmail: "ou continuer avec l'email",
    forgotPassword: "Mot de passe oublié ?",
    loginButton: "Se connecter",
    signupButton: "Créer le compte",
    noAccount: "Pas encore de compte ?",
    hasAccount: "Déjà un compte ?",
    signupLink: "S'inscrire",
    loginLink: "Se connecter",
    terms: "En vous inscrivant, vous acceptez les Conditions d'utilisation et la Politique de confidentialité de Wizecatch.",
  },
  dashboard: {
    welcome: "Bon retour, {name}",
    subtitle: "Voici ce qui se passe sur vos sites.",
    addNewSite: "Ajouter un site",
    yourSites: "Vos sites",
    totalSites: "Sites au total",
    totalReviews: "Avis au total",
    totalVisits: "Visites au total",
    visitsChart: "Visites sur tous les sites (30 jours)",
    reviewsChart: "Avis collectés (30 jours)",
    visitsBySite: "Visites par site",
    noReviewSites: "Aucun site en mode Avis pour l'instant.",
  },
  siteCard: {
    reviewsMode: "Avis",
    analyticsMode: "Analytics uniquement",
  },
  wizard: {
    backToDashboard: "Retour au dashboard",
    title: "Ajouter un site",
    subtitle: "Créez un site pour obtenir un script d'intégration unique.",
    stepLabel: "Étape {current} sur {total}",
    step1Title: "Détails du site",
    step1Desc: "Donnez un nom et un domaine à votre site.",
    siteName: "Nom du site",
    siteNamePlaceholder: "Launchbase",
    domain: "Domaine",
    domainPlaceholder: "launchbase.app",
    domainHint: "N'incluez pas https:// — juste le domaine.",
    step2Title: "Choisissez un mode",
    step2Desc: "Ce choix pourra être modifié plus tard depuis les paramètres du site.",
    reviewsModeTitle: "Collecter des avis",
    reviewsModeDesc:
      "Affichez un popup ou formulaire aux visiteurs et collectez notes, témoignages ou retours.",
    analyticsModeTitle: "Suivre les visites uniquement",
    analyticsModeDesc:
      "Aucun popup affiché aux visiteurs. Le script suit silencieusement les visites par pays et ville.",
    step3Title: "Choisissez un modèle d'avis",
    step3Desc: "Choisissez le format que les visiteurs utiliseront pour laisser un avis.",
    back: "Retour",
    next: "Suivant",
    createSite: "Créer le site",
    cancel: "Annuler",
  },
  siteDetail: {
    backToSites: "Retour à tous les sites",
    active: "Actif",
    visits: "Visites",
    avgRating: "Note moyenne",
    tabs: {
      overview: "Aperçu",
      stats: "Statistiques",
      reviews: "Avis",
      templateSettings: "Modèle d'avis",
      widgetSettings: "Paramètres du widget",
    },
    embedScript: "Script d'intégration",
    embedScriptDesc: "Collez ce code avant la balise fermante </body>.",
    wallTitle: "Afficher vos avis",
    wallDesc:
      "Collez ceci où vous voulez sur votre page — les avis publiés y apparaîtront.",
    wallHint:
      "Seuls les avis publiés sont affichés. La mise en page suit le format choisi dans les paramètres du widget.",
    embedBothDesc:
      "Ajoutez le script une fois, puis placez la balise du mur là où vous voulez voir vos avis.",
    wordpressTitle: "Vous êtes sur WordPress ?",
    wordpressDesc:
      "Téléchargez un plugin avec votre clé déjà configurée. Téléversez, activez, c'est fait — aucun code à coller, et rien n'est perdu à la mise à jour de votre thème.",
    wordpressCta: "Télécharger le plugin",
    wordpressHint:
      "Dans les réglages du plugin, vous pouvez ne collecter que les statistiques, sans afficher le formulaire d'avis. Vos avis ne s'affichent jamais tant que vous n'avez pas ajouté le shortcode [wizecatch_wall] à une page.",
    wordpressManual: "Ou ajoutez le script à la main :",
    modeLabel: "Mode",
    templateLabel: "Modèle",
    notFoundTitle: "Site introuvable",
    notFoundDesc: "Impossible de trouver un site avec cet identifiant. Il a peut-être été supprimé.",
  },
  stats: {
    noData: "Aucune donnée",
    exportReviews: "Exporter les avis",
    exportVisits: "Exporter les visites",
    exportPending: "Préparation…",
    exportUpgrade: "Disponible sur les offres payantes",
    exportFailed: "Échec de l'export, réessayez",
    period7: "7 jours",
    period30: "30 jours",
    period90: "90 jours",
    vsPrevious: "vs période précédente",
    newMetric: "nouveau",
    uniqueVisitors: "Visiteurs uniques",
    pageviews: "Pages vues",
    cities: "Principales villes",
    languages: "Langues",
    entryPages: "Pages d'entrée",
    topPagesReal: "Pages les plus vues",
    utmSources: "Sources de campagne",
    utmCampaigns: "Campagnes",
    npsTitle: "Net Promoter Score",
    npsPromoters: "Promoteurs",
    npsPassives: "Passifs",
    npsDetractors: "Détracteurs",
    npsResponses: "{count} réponses",
    collectionRate: "Taux de collecte d'avis",
    collectionRateDesc: "Avis pour 100 visiteurs uniques",
    ratingByCountry: "Satisfaction par pays",
    ratingByDevice: "Satisfaction par appareil",
    ratingTrend: "Note moyenne dans le temps",
    reviewsCollected: "Avis collectés",
    ratingCrossHint: "Là où vos visiteurs sont les plus satisfaits — et là où ils ne le sont pas.",
    visitsOverTime: "Visites sur les 30 derniers jours",
    scoreOverTime: "Tendance du score sur les 30 derniers jours",
    ratingBreakdown: "Répartition des notes",
    countryBreakdown: "Visiteurs par pays",
    countriesReached: "Pays touchés",
    noRatingData: "Ce modèle ne collecte pas de score numérique.",
    visitorMap: "Carte des visiteurs",
    device: "Appareil",
    os: "Système d'exploitation",
    browser: "Navigateur",
    avgDuration: "Temps moyen sur le site",
    bounceRate: "Taux de rebond",
    sources: "Sources de trafic",
    topPages: "Pages les plus vues",
    visitorType: "Nouveaux vs récurrents",
    hourly: "Visites par heure de la journée",
    newVisitors: "Nouveaux visiteurs",
  },
  reviewsTab: {
    allRatings: "Toutes les notes",
    allStatuses: "Tous les statuts",
    published: "Publié",
    pending: "En attente",
    hidden: "Masqué",
    noReviews: "Aucun avis pour l'instant",
    noReviewsDesc: "Une fois votre widget en ligne, les avis collectés sur ce site apparaîtront ici.",
    noMatch: "Aucun avis ne correspond à vos filtres",
    noMatchDesc: "Essayez d'ajuster les filtres de note ou de statut pour voir plus d'avis.",
    clearFilters: "Réinitialiser les filtres",
  },
  templateSettingsTab: {
    activeTemplate: "Modèle actif",
    changeTemplate: "Changer de modèle",
    preview: "Aperçu en direct",
    selectTemplate: "Sélectionner un modèle",
    content: "Contenu",
    contentDesc: "Personnalisez le texte que voient les visiteurs sur le widget.",
    titleLabel: "Titre de la question",
    buttonLabel: "Texte du bouton",
    behavior: "Comportement",
  },
  widgetSettingsTab: {
    title: "Paramètres du widget",
    description: "Contrôlez l'affichage du widget sur {domain}.",
    position: "Position",
    trigger: "Déclencheur",
    format: "Format d'affichage",
    save: "Enregistrer",
    formSection: "Formulaire de collecte",
    formSectionDesc:
      "L'invitation affichée aux visiteurs pour qu'ils laissent un avis.",
    wallSection: "Mur d'avis",
    wallSectionDesc:
      "La mise en page des avis publiés à l'intérieur de votre balise <div data-wizecatch-wall>.",
    preview: "Aperçu",
  },
  settings: {
    title: "Paramètres",
    subtitle: "Gérez votre compte et votre abonnement.",
    profile: "Profil",
    memberSince: "Membre depuis {date}",
    fullName: "Nom complet",
    email: "Email",
    saveChanges: "Enregistrer",
    subscription: "Abonnement",
    freePlanDesc: "Vous êtes sur l'offre Gratuite — 1 site, jusqu'à 50 avis collectés.",
    proPlanDesc: "Vous êtes sur l'offre Pro avec des avis illimités sur jusqu'à 10 sites.",
    upgradeToPro: "Passer à Pro",
    language: "Langue",
    languageDesc: "Choisissez la langue de l'interface.",
    session: "Session",
    sessionDesc: "Déconnectez-vous de Wizecatch sur cet appareil.",
    logOut: "Se déconnecter",
  },
  common: {
    saved: "Enregistré",
    copy: "Copier",
    copied: "Copié",
  },

  templates: {
    star_rating: {
      name: "Note en étoiles",
      description:
        "Une simple note de 1 à 5 étoiles. Le moyen le plus rapide de recueillir un avis.",
    },
    star_comment: {
      name: "Étoiles + commentaire",
      description:
        "La note en étoiles accompagnée d'un commentaire facultatif, pour plus de contexte.",
    },
    thumbs: {
      name: "Pouce haut / bas",
      description: "Un seul clic, j'aime ou je n'aime pas — l'option la moins contraignante.",
    },
    nps: {
      name: "Score NPS",
      description:
        "Note de 0 à 10 sur la probabilité de recommander, avec commentaire facultatif.",
    },
    testimonial: {
      name: "Témoignage",
      description: "Nom et texte libre, sans note associée.",
    },
  },

  widgetOptions: {
    positions: {
      "bottom-right": "En bas à droite",
      "bottom-left": "En bas à gauche",
      "top-right": "En haut à droite",
      "top-left": "En haut à gauche",
      inline: "Intégré dans la page",
    },
    triggers: {
      load: "Au chargement de la page",
      scroll: "Au défilement",
      delay: "Après 5 secondes",
    },
    formats: {
      carousel: "Carrousel",
      grid: "Grille",
      list: "Liste",
      popup: "Carte flottante",
    },
  },

  reviewStatus: {
    published: "Publié",
    pending: "En attente",
    hidden: "Masqué",
  },

  states: {
    noVisits: "Aucune visite pour l'instant",
    noVisitsDesc:
      "Dès que le script sera en ligne sur votre site, les visites apparaîtront ici en quelques secondes.",
    noVisitsNoSite:
      "Ajoutez un site et intégrez le script pour commencer à collecter des données.",
    statsError: "Impossible de charger les statistiques",
    statsErrorDesc:
      "Une erreur est survenue pendant la récupération des données. Essayez de recharger la page.",
    requireComment: "Exiger un commentaire",
    requireCommentDesc: "Les visiteurs devront écrire quelque chose avant de valider.",
    showLocation: "Afficher la localisation",
    showLocationDesc: "Montrer la ville et le pays à côté des avis publiés.",
    anonymous: "Anonyme",
  },

  faqItems: [
    {
      question: "Est-ce que Wizecatch va ralentir mon site ?",
      answer:
        "Non. Le script fait quelques kilo-octets, se charge de façon asynchrone et ne bloque jamais l'affichage. En mode analytics uniquement, il n'y a aucune interface visible — donc rien à dessiner.",
    },
    {
      question: "Puis-je l'utiliser avec un outil no-code comme Webflow ou Framer ?",
      answer:
        "Oui. Comme il s'agit d'une simple balise script, ça fonctionne partout où vous pouvez coller du HTML — Webflow, Framer, Squarespace, Shopify, Carrd et les pages HTML classiques, de la même façon.",
    },
    {
      question: "Que se passe-t-il quand j'atteins la limite d'avis de l'offre gratuite ?",
      answer:
        "Votre widget continue de fonctionner et d'afficher vos avis existants. Les nouveaux sont mis en file d'attente jusqu'à votre passage à une offre payante : vous ne perdez aucun avis, vous ne verrez simplement pas les nouveaux se publier d'ici là.",
    },
    {
      question: "Puis-je passer un site du mode Analytics au mode Avis plus tard ?",
      answer:
        "Oui, à tout moment depuis les paramètres du site. Votre historique de visites reste intact dans les deux cas — changer de mode modifie seulement l'affichage ou non d'un formulaire d'avis aux visiteurs.",
    },
    {
      question: "Est-ce que vous stockez les adresses IP des visiteurs ?",
      answer:
        "Nous déduisons le pays et la ville au moment de la collecte, puis nous ne conservons pas l'adresse IP. Les statistiques sont agrégées et jamais rattachées à une identité — c'est précisément pour cela que vous n'avez pas besoin de bandeau cookies.",
    },
    {
      question: "Qu'arrive-t-il à mes avis si j'arrête de payer ?",
      answer:
        "Rien n'est supprimé. Votre compte revient aux limites de l'offre gratuite : l'historique ancien cesse de s'afficher et le badge réapparaît — mais tous les avis collectés restent dans votre tableau de bord, et ceux que vous aviez publiés restent en ligne sur votre site.",
    },
    {
      question: "Ai-je besoin d'un serveur ou d'une base de données ?",
      answer:
        "Non. Wizecatch fonctionne entièrement comme un service hébergé — vous collez le script, nous gérons la collecte, le stockage et le tableau de bord. Rien à déployer ni à maintenir de votre côté.",
    },
  ],

  testimonials: {
    pt1: {
      role: "Fondateur, Launchbase",
      quote:
        "J'ai essayé trois widgets d'avis avant celui-ci. Wizecatch est le premier à ne pas avoir dégradé la vitesse de ma page. Intégré en moins de cinq minutes, et je n'y ai plus jamais repensé.",
    },
    pt2: {
      role: "Propriétaire de boutique en ligne",
      quote:
        "Je ne code pas. J'ai collé une ligne dans Shopify et ça a marché. C'est vraiment tout ce que j'ai eu à faire.",
    },
    pt3: {
      role: "Co-fondatrice, Formly",
      quote:
        "Basculer un de nos sites en mode analytics uniquement a pris trente secondes, sans toucher une seule ligne du code d'intégration — même script, comportement différent.",
    },
    pt4: {
      role: "Responsable marketing",
      quote:
        "Deux abonnements remplacés par un seul. Personne n'a eu besoin de solliciter l'équipe technique.",
    },
    pt5: {
      role: "Designer produit",
      quote:
        "Enfin un widget qui a l'air d'appartenir à mon site au lieu de crier « intégration tierce ». Le carrousel colle presque parfaitement à notre charte, sans réglage.",
    },
    pt6: {
      role: "Propriétaire de studio de yoga",
      quote:
        "Je voulais juste savoir si mon nouveau site recevait des visites. Il en recevait — et maintenant j'y collecte aussi des avis.",
    },
    pt7: {
      role: "Directeur technique, Devnotes",
      quote:
        "On collecte un score NPS après chaque mise en production. Les détracteurs partent directement vers notre support, les promoteurs deviennent des témoignages. C'est le fonctionnement qu'on voulait construire nous-mêmes.",
    },
    pt8: {
      role: "Dirigeant d'agence",
      quote:
        "On l'installe sur tous les sites clients désormais. Ils ont leur propre page d'avis sans jamais avoir à nous appeler.",
    },
    pt9: {
      role: "Fondatrice, Pixeldeck",
      quote:
        "Aucune pression de notation avec le format témoignage — juste des citations sincères de vrais clients.",
    },
  },
};

export const dictionaries = { en, fr };
