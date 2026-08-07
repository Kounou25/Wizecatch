"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckIcon, ActivityIcon, LoaderIcon } from "@/components/icons";
import { updateSiteWidget } from "@/lib/sites/actions";
import {
  widgetPositions,
  widgetTriggers,
  widgetFormats,
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
    <Card className="max-w-lg p-5">
      <h2 className="text-sm font-semibold text-zinc-900">{dict.widgetSettingsTab.title}</h2>
      <p className="mt-1 text-sm text-zinc-500">
        {interpolate(dict.widgetSettingsTab.description, { domain: site.domain })}
      </p>

      <form onSubmit={handleSave} className="mt-4 space-y-4">
        <div>
          <Label htmlFor="position">{dict.widgetSettingsTab.position}</Label>
          <Select
            id="position"
            value={position}
            onChange={(event) => setPosition(event.target.value as WidgetPosition)}
          >
            {widgetPositions.map((option) => (
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
            {widgetTriggers.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="format">{dict.widgetSettingsTab.format}</Label>
          <Select
            id="format"
            value={format}
            onChange={(event) => setFormat(event.target.value as WidgetFormat)}
          >
            {widgetFormats.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

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
