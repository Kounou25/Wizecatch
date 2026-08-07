"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { TemplateCard } from "@/components/dashboard/template-card";
import { TemplatePreviewForm } from "@/components/dashboard/template-preview-form";
import { templateIcons } from "@/components/template-icon";
import { CheckIcon, LoaderIcon } from "@/components/icons";
import { updateSiteTemplate } from "@/lib/sites/actions";
import {
  getTemplateById,
  reviewTemplates,
  defaultTemplateCustomization,
  type Site,
  type ReviewTemplateId,
} from "@/lib/mock-data";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function TemplateSettingsTab({ site, dict }: { site: Site; dict: Dictionary }) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [requireComment, setRequireComment] = useState(false);
  const [showLocation, setShowLocation] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const templateId = site.templateId;
  const defaults = templateId ? defaultTemplateCustomization[templateId] : null;

  const [title, setTitle] = useState(site.templateCustomization?.title ?? defaults?.title ?? "");
  const [buttonLabel, setButtonLabel] = useState(
    site.templateCustomization?.buttonLabel ?? defaults?.buttonLabel ?? "",
  );

  if (!templateId || !defaults) return null;

  const template = getTemplateById(templateId);
  const Icon = templateIcons[templateId];

  function handleSelectTemplate(id: ReviewTemplateId) {
    const nextDefaults = defaultTemplateCustomization[id];
    // Optimiste : l'aperçu bascule aussitôt, la base suit.
    setTitle(nextDefaults.title);
    setButtonLabel(nextDefaults.buttonLabel);
    setGalleryOpen(false);
    setError(null);

    startTransition(async () => {
      const result = await updateSiteTemplate({
        siteId: site.id,
        templateId: id,
        title: nextDefaults.title,
        buttonLabel: nextDefaults.buttonLabel,
      });
      if (!result.ok) setError(result.error);
    });
  }

  function handleSaveContent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // Le composant sort plus haut si le site n'a pas de template, mais
    // TypeScript ne conserve pas ce narrowing à l'intérieur d'une closure.
    const currentTemplate = site.templateId;
    if (!currentTemplate) return;

    startTransition(async () => {
      const result = await updateSiteTemplate({
        siteId: site.id,
        templateId: currentTemplate,
        title,
        buttonLabel,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card className="p-5">
          <p className="text-xs font-medium text-zinc-400">{dict.templateSettingsTab.activeTemplate}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-900">{template.name}</p>
              <p className="text-xs text-zinc-500">{template.description}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setGalleryOpen((open) => !open)}
          >
            {dict.templateSettingsTab.changeTemplate}
          </Button>

          {galleryOpen && (
            <div className="mt-4 grid gap-3 border-t border-zinc-100 pt-4 sm:grid-cols-2">
              {reviewTemplates.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  selected={t.id === templateId}
                  onClick={() => handleSelectTemplate(t.id)}
                />
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900">
            {dict.templateSettingsTab.content}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">{dict.templateSettingsTab.contentDesc}</p>

          <form onSubmit={handleSaveContent} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="template-title">{dict.templateSettingsTab.titleLabel}</Label>
              <Input
                id="template-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={defaults.title}
              />
            </div>
            <div>
              <Label htmlFor="template-button">{dict.templateSettingsTab.buttonLabel}</Label>
              <Input
                id="template-button"
                value={buttonLabel}
                onChange={(event) => setButtonLabel(event.target.value)}
                placeholder={defaults.buttonLabel}
              />
            </div>
            <Button
              type="submit"
              variant={saved ? "outline" : "primary"}
              size="sm"
              disabled={isPending}
            >
              {isPending ? (
                <LoaderIcon className="h-4 w-4" />
              ) : saved ? (
                <CheckIcon className="h-4 w-4 text-green-600" />
              ) : null}
              {saved ? dict.common.saved : dict.widgetSettingsTab.save}
            </Button>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-100">
                {error}
              </p>
            )}
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900">
            {dict.templateSettingsTab.behavior}
          </h3>
          <div className="mt-3 divide-y divide-zinc-100">
            <Toggle
              checked={requireComment}
              onChange={setRequireComment}
              label="Require a comment"
              description="Visitors must write something before submitting."
            />
            <Toggle
              checked={showLocation}
              onChange={setShowLocation}
              label="Show reviewer location"
              description="Display city and country next to published reviews."
            />
          </div>
        </Card>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-zinc-900">
          {dict.templateSettingsTab.preview}
        </p>
        <div className="lg:sticky lg:top-6">
          <TemplatePreviewForm templateId={templateId} title={title} buttonLabel={buttonLabel} />
        </div>
      </div>
    </div>
  );
}
