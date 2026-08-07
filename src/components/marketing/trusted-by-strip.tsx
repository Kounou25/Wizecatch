import { sites } from "@/lib/mock-data";

const names = sites.map((site) => site.name);
const loop = [...names, ...names];

export function TrustedByStrip({ label }: { label: string }) {
  return (
    <div className="border-y border-zinc-100 bg-white py-10">
      <p className="text-center text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-16 hover:[animation-play-state:paused]">
          {loop.map((name, index) => (
            <span
              key={`${name}-${index}`}
              className="shrink-0 text-xl font-semibold tracking-tight text-zinc-300"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
