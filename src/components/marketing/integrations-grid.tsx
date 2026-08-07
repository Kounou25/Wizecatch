import { TechLogo } from "@/components/tech-logos";
import { Reveal } from "@/components/reveal";
import { Spotlight } from "@/components/spotlight";
import type { Integration } from "@/lib/mock-data";

export function IntegrationsGrid({ integrations }: { integrations: Integration[] }) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
      {integrations.map((integration, index) => (
        <Reveal key={integration.name} delay={(index % 4) * 80}>
          <Spotlight className="group flex h-full flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-zinc-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:ring-purple-200">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 ring-1 ring-zinc-100 transition-transform duration-200 group-hover:scale-105">
              <TechLogo name={integration.name} />
            </span>
            <span className="text-sm font-medium text-zinc-700">{integration.name}</span>
          </Spotlight>
        </Reveal>
      ))}
    </div>
  );
}
