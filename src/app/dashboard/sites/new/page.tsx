"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeSelector, type ModeOption } from "@/components/dashboard/mode-selector";
import { TemplateCard } from "@/components/dashboard/template-card";
import { TemplatePreviewForm } from "@/components/dashboard/template-preview-form";
import { SiteFavicon } from "@/components/dashboard/site-favicon";
import { MessageSquareIcon, ActivityIcon, LoaderIcon } from "@/components/icons";
import { useLanguage } from "@/components/providers/language-provider";
import { cn, interpolate } from "@/lib/utils";
import { createSite } from "@/lib/sites/actions";
import { reviewTemplates, type SiteMode, type ReviewTemplateId } from "@/lib/mock-data";

export default function NewSitePage() {
  const router = useRouter();
  const { dict } = useLanguage();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [mode, setMode] = useState<SiteMode>("reviews");
  const [templateId, setTemplateId] = useState<ReviewTemplateId>("star_comment");
  const [error, setError] = useState<string | null>(null);

  const totalSteps = mode === "reviews" ? 3 : 2;

  const modeOptions: ModeOption[] = [
    {
      mode: "reviews",
      title: dict.wizard.reviewsModeTitle,
      description: dict.wizard.reviewsModeDesc,
      icon: MessageSquareIcon,
    },
    {
      mode: "analytics_only",
      title: dict.wizard.analyticsModeTitle,
      description: dict.wizard.analyticsModeDesc,
      icon: ActivityIcon,
    },
  ];

  function handleNext() {
    setStep((current) => current + 1);
  }

  function handleBack() {
    setStep((current) => Math.max(1, current - 1));
  }

  function handleCreate() {
    setError(null);

    startTransition(async () => {
      const result = await createSite({
        name,
        domain,
        mode,
        templateId: mode === "reviews" ? templateId : undefined,
      });

      if (!result.ok) {
        setError(result.error);
        // La validation du nom et du domaine se fait à l'étape 1 :
        // on y ramène l'utilisateur pour qu'il voie le champ fautif.
        if (/name|domain/i.test(result.error)) setStep(1);
        return;
      }

      router.push(`/dashboard/sites/${result.data.id}`);
    });
  }

  const step1Valid = name.trim().length > 0 && domain.trim().length > 0;
  const isTemplateStep = step === 3 && mode === "reviews";

  // N'affiche le favicon qu'une fois le domaine plausible, pour ne pas
  // déclencher une requête à chaque caractère tapé.
  const cleanedDomain = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
  const previewDomain = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(cleanedDomain)
    ? cleanedDomain
    : null;

  return (
    <div className={cn("mx-auto transition-all duration-300", isTemplateStep ? "max-w-4xl" : "max-w-2xl")}>
      <Link
        href="/dashboard"
        className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
      >
        ← {dict.wizard.backToDashboard}
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900">
        {dict.wizard.title}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">{dict.wizard.subtitle}</p>

      <div className="mt-6 flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-150 ${
              index < step ? "bg-purple-600" : "bg-zinc-200"
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-xs font-medium text-zinc-400">
        {interpolate(dict.wizard.stepLabel, { current: step, total: totalSteps })}
      </p>

      <Card className="mt-4 p-6">
        {step === 1 && (
          <div>
            <h2 className="text-base font-semibold text-zinc-900">{dict.wizard.step1Title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{dict.wizard.step1Desc}</p>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="name">{dict.wizard.siteName}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={dict.wizard.siteNamePlaceholder}
                />
              </div>
              <div>
                <Label htmlFor="domain">{dict.wizard.domain}</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="domain"
                    value={domain}
                    onChange={(event) => setDomain(event.target.value)}
                    placeholder={dict.wizard.domainPlaceholder}
                  />
                  {/* Confirme visuellement que le domaine saisi est le bon. */}
                  {previewDomain && <SiteFavicon domain={previewDomain} size="sm" />}
                </div>
                <p className="mt-1.5 text-xs text-zinc-400">{dict.wizard.domainHint}</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-base font-semibold text-zinc-900">{dict.wizard.step2Title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{dict.wizard.step2Desc}</p>

            <div className="mt-6">
              <ModeSelector value={mode} onChange={setMode} options={modeOptions} />
            </div>
          </div>
        )}

        {isTemplateStep && (
          <div>
            <h2 className="text-base font-semibold text-zinc-900">{dict.wizard.step3Title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{dict.wizard.step3Desc}</p>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
              <div className="grid gap-3 sm:grid-cols-2">
                {reviewTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    selected={templateId === template.id}
                    onClick={() => setTemplateId(template.id)}
                  />
                ))}
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                  {dict.templateSettingsTab.preview}
                </p>
                <TemplatePreviewForm templateId={templateId} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-100">
            {error}
          </p>
        )}

        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isPending}
              className="flex-1"
            >
              {dict.wizard.back}
            </Button>
          )}
          {step === totalSteps ? (
            <Button onClick={handleCreate} disabled={isPending} className="flex-1">
              {isPending && <LoaderIcon className="h-4 w-4" />}
              {dict.wizard.createSite}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={step === 1 && !step1Valid}
              className="flex-1"
            >
              {dict.wizard.next}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
