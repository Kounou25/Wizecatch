"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckIcon, ActivityIcon, LoaderIcon } from "@/components/icons";
import { WallPreview } from "@/components/dashboard/wall-preview";
import { updateSiteWidget } from "@/lib/sites/actions";
import {
  getWidgetPositions,
  getWidgetTriggers,
  getWidgetFormats,
} from "@/lib/i18n/content";
import { cn } from "@/lib/utils";
import {
  type Site,
  type WidgetPosition,
  type WidgetTrigger,
  type WidgetFormat,
} from "@/lib/mock-data";
import { interpolate } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function WidgetSettingsTab({ site, dict }: { site: Site; dict: Dictionary }) {
  const [position, setPosition] = useState<WidgetPosition>(site.widgetSettings.position);
  const [trigger, setTrigger] = useState<WidgetTrigger>(site.widgetSettings.trigger);
  const [format, setFormat] = useState<WidgetFormat>(site.widgetSettings.format);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (site.mode === "analytics_only") {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
          <ActivityIcon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">
            {dict.templatesSection.analyticsTitle}
          </h3>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-zinc-500">
            {dict.templatesSection.analyticsDesc}
          </p>
        </div>
      </Card>
    );
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateSiteWidget({
        siteId: site.id,
        settings: { position, trigger, format },
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
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-zinc-900">{dict.widgetSettingsTab.title}</h2>
      <p className="mt-1 text-sm text-zinc-500">
        {interpolate(dict.widgetSettingsTab.description, { domain: site.domain })}
      </p>

      <form onSubmit={handleSave} className="mt-6 space-y-8">
        {/* ---- Section 1 : le formulaire de collecte ---- */}
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-zinc-900">
              {dict.widgetSettingsTab.formSection}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              {dict.widgetSettingsTab.formSectionDesc}
            </p>
          </div>

          <div>
            <Label htmlFor="position">{dict.widgetSettingsTab.position}</Label>
            <Select
              id="position"
              value={position}
              onChange={(event) => setPosition(event.target.value as WidgetPosition)}
            >
              {getWidgetPositions(dict).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="trigger">{dict.widgetSettingsTab.trigger}</Label>
            <Select
              id="trigger"
              value={trigger}
              onChange={(event) => setTrigger(event.target.value as WidgetTrigger)}
            >
              {getWidgetTriggers(dict).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </section>

        {/* ---- Section 2 : le mur d'avis, avec aperçu ---- */}
        <section className="border-t border-zinc-100 pt-6">
          <h3 className="text-sm font-semibold text-zinc-900">
            {dict.widgetSettingsTab.wallSection}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            {dict.widgetSettingsTab.wallSectionDesc}
          </p>

          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              {getWidgetFormats(dict).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormat(option.value)}
                  aria-pressed={format === option.value}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150",
                    format === option.value
                      ? "bg-purple-50 font-medium text-purple-700 ring-2 ring-purple-600"
                      : "text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-1",
                      format === option.value
                        ? "bg-purple-600 ring-purple-600"
                        : "ring-zinc-300",
                    )}
                  >
                    {format === option.value && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  {option.label}
                </button>
              ))}
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                {dict.widgetSettingsTab.preview}
              </p>
              <WallPreview format={format} />
            </div>
          </div>
        </section>

        <Button
          type="submit"
          variant={saved ? "outline" : "primary"}
          className="w-full"
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
  );
}
