"use client";

import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { WidgetMockup } from "@/components/marketing/widget-mockup";
import { PricingCard } from "@/components/marketing/pricing-card";
import { TrustedByStrip } from "@/components/marketing/trusted-by-strip";
import { WallOfLove } from "@/components/marketing/wall-of-love";
import { IntegrationsGrid } from "@/components/marketing/integrations-grid";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { LiveActivity } from "@/components/marketing/live-activity";
import { TemplatePlayground } from "@/components/marketing/template-playground";
import { EmbedTabs } from "@/components/marketing/embed-tabs";
import { Reveal } from "@/components/reveal";
import { Spotlight } from "@/components/spotlight";
import { TiltCard } from "@/components/tilt-card";
import { CountUp } from "@/components/count-up";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import { Button } from "@/components/ui/button";
import { StatsLineChart } from "@/components/dashboard/stats-line-chart";
import { useLanguage } from "@/components/providers/language-provider";
import {
  GlobeIcon,
  CodeIcon,
  MessageSquareIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@/components/icons";
import {
  pricingPlans,
  productTestimonials,
  integrations,
  faqs,
  getDailyVisitCounts,
  getCountryBreakdown,
} from "@/lib/mock-data";

const previewVisits = getDailyVisitCounts("launchbase").map((point) => ({
  date: point.date,
  value: point.visits,
}));
const previewCountries = getCountryBreakdown("launchbase");
const previewTotalVisits = previewVisits.reduce((sum, point) => sum + point.value, 0);

export default function Home() {
  const { dict } = useLanguage();

  const steps = [
    { number: "01", icon: GlobeIcon, title: dict.howItWorks.step1Title, description: dict.howItWorks.step1Desc },
    { number: "02", icon: CodeIcon, title: dict.howItWorks.step2Title, description: dict.howItWorks.step2Desc },
    { number: "03", icon: MessageSquareIcon, title: dict.howItWorks.step3Title, description: dict.howItWorks.step3Desc },
  ];

  const trustPoints = [dict.hero.trust1, dict.hero.trust2, dict.hero.trust3];

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgressBar />
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] bg-gradient-to-b from-purple-50 via-white to-white" />
          <div
            aria-hidden="true"
            className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]"
          />
          <div
            aria-hidden="true"
            className="animate-float pointer-events-none absolute -top-24 right-[8%] -z-10 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="animate-float-delayed pointer-events-none absolute top-40 left-[2%] -z-10 h-56 w-56 rounded-full bg-purple-300/30 blur-3xl"
          />

          <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:py-28">
            <Reveal>
              <span className="animate-pulse-ring inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-100">
                {dict.hero.badge}
              </span>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                {dict.hero.titlePart1}{" "}
                <span className="text-gradient-animate">{dict.hero.titleHighlight}</span>
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-600">
                {dict.hero.subtitle}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="/signup" size="lg">
                  {dict.hero.ctaPrimary}
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
                <Button href="#how-it-works" variant="outline" size="lg">
                  {dict.hero.ctaSecondary}
                </Button>
              </div>

              <ul className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:gap-6">
                {trustPoints.map((point) => (
                  <li key={point} className="flex items-center gap-1.5 text-sm text-zinc-500">
                    <CheckIcon className="h-4 w-4 text-purple-600" />
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={150} className="relative flex justify-center lg:justify-end">
              <TiltCard className="w-full max-w-lg">
                <WidgetMockup />
              </TiltCard>

              <div className="pointer-events-none absolute -bottom-5 left-1/2 z-10 -translate-x-1/2 lg:left-auto lg:right-8 lg:translate-x-0">
                <LiveActivity label={dict.hero.liveLabel} />
              </div>
            </Reveal>
          </div>
        </section>

        <TrustedByStrip label={dict.trustedBy.label} />

        {/* How it works */}
        <section id="how-it-works" className="border-t border-zinc-100 bg-zinc-50/60 py-24 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="max-w-2xl">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-600">
                {dict.howItWorks.eyebrow}
              </h2>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
                {dict.howItWorks.title}
              </p>
            </Reveal>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <Reveal key={step.number} delay={index * 100}>
                  <Spotlight className="h-full rounded-2xl bg-white p-7 shadow-sm ring-1 ring-zinc-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                    <span className="text-sm font-semibold text-zinc-300">{step.number}</span>
                    <span className="mt-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                      <step.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-zinc-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                      {step.description}
                    </p>
                  </Spotlight>
                </Reveal>
              ))}
            </div>

            <Reveal delay={300} className="mx-auto mt-16 max-w-2xl">
              <EmbedTabs />
            </Reveal>
          </div>
        </section>

        {/* Templates + analytics-only */}
        <section className="py-24 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-600">
                {dict.templatesSection.eyebrow}
              </h2>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
                {dict.templatesSection.title}
              </p>
              <p className="mt-3 text-zinc-600">{dict.templatesSection.subtitle}</p>
            </Reveal>

            <Reveal delay={100} className="mt-16">
              <TemplatePlayground
                analyticsTitle={dict.templatesSection.analyticsTitle}
                analyticsDesc={dict.templatesSection.analyticsDesc}
                analyticsBadge={dict.templatesSection.analyticsBadge}
                previewLabel={dict.templatesSection.previewLabel}
                hint={dict.templatesSection.hint}
              />
            </Reveal>
          </div>
        </section>

        {/* Wall of love */}
        <section className="border-t border-zinc-100 bg-zinc-50/60 py-24 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-600">
                {dict.wallOfLove.eyebrow}
              </h2>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
                {dict.wallOfLove.title}
              </p>
              <p className="mt-3 text-zinc-600">{dict.wallOfLove.subtitle}</p>
            </Reveal>

            <div className="mt-16">
              <WallOfLove testimonials={productTestimonials} />
            </div>
          </div>
        </section>

        {/* Stats preview — dark break in the page rhythm */}
        <section className="relative overflow-hidden bg-zinc-950 py-24 sm:py-28">
          <div aria-hidden="true" className="bg-grid-dark pointer-events-none absolute inset-0" />
          <div
            aria-hidden="true"
            className="animate-float pointer-events-none absolute -right-20 top-10 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl"
          />

          <div className="relative mx-auto max-w-6xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <Reveal>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-400">
                  {dict.statsPreview.eyebrow}
                </h2>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  {dict.statsPreview.title}
                </p>
                <p className="mt-3 max-w-md text-zinc-400">{dict.statsPreview.subtitle}</p>

                <div className="mt-8 flex gap-10">
                  <div>
                    <p className="text-4xl font-semibold tracking-tight text-white">
                      <CountUp end={previewTotalVisits} />
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">{dict.siteDetail.visits} (30d)</p>
                  </div>
                  <div>
                    <p className="text-4xl font-semibold tracking-tight text-white">
                      <CountUp end={previewCountries.length} />
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">{dict.stats.countriesReached}</p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={150}>
                <div className="rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-zinc-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-900">
                      {dict.stats.visitsOverTime}
                    </span>
                    <span className="text-xs text-zinc-400">launchbase.app</span>
                  </div>
                  <div className="mt-4">
                    <StatsLineChart data={previewVisits} />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="border-t border-zinc-100 bg-zinc-50/60 py-24 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-600">
                {dict.integrations.eyebrow}
              </h2>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
                {dict.integrations.title}
              </p>
              <p className="mt-3 text-zinc-600">{dict.integrations.subtitle}</p>
            </Reveal>

            <div className="mt-16">
              <IntegrationsGrid integrations={integrations} />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-600">
                {dict.pricing.eyebrow}
              </h2>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
                {dict.pricing.title}
              </p>
              <p className="mt-3 text-zinc-600">{dict.pricing.subtitle}</p>
            </Reveal>

            <div className="mx-auto mt-16 grid max-w-3xl gap-8 sm:grid-cols-2">
              {pricingPlans.map((plan, index) => (
                <Reveal key={plan.id} delay={index * 100}>
                  <PricingCard plan={plan} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-zinc-100 bg-zinc-50/60 py-24 sm:py-28">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal className="text-center">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-600">
                {dict.faq.eyebrow}
              </h2>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
                {dict.faq.title}
              </p>
            </Reveal>

            <Reveal delay={150} className="mt-12">
              <FaqAccordion items={faqs} />
            </Reveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-zinc-100 bg-zinc-900 py-20 sm:py-24">
          <Reveal className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              {dict.finalCta.title}
            </h2>
            <p className="mt-3 text-zinc-400">{dict.finalCta.subtitle}</p>
            <div className="mt-8 flex justify-center">
              <Button href="/signup" size="lg">
                {dict.finalCta.cta}
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
