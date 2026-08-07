"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const SNIPPETS = [
  {
    id: "html",
    label: "HTML",
    file: "index.html",
    code: `<script
  src="https://cdn.wizecatch.com/widget.js"
  data-site="your-site-id"
  async
></script>`,
  },
  {
    id: "nextjs",
    label: "Next.js",
    file: "app/layout.tsx",
    code: `import Script from "next/script";

<Script
  src="https://cdn.wizecatch.com/widget.js"
  data-site="your-site-id"
  strategy="lazyOnload"
/>`,
  },
  {
    id: "react",
    label: "React",
    file: "App.jsx",
    code: `useEffect(() => {
  const s = document.createElement("script");
  s.src = "https://cdn.wizecatch.com/widget.js";
  s.dataset.site = "your-site-id";
  document.body.appendChild(s);
}, []);`,
  },
  {
    id: "wordpress",
    label: "WordPress",
    file: "functions.php",
    code: `add_action('wp_footer', function () {
  echo '<script src="https://cdn.wizecatch.com/widget.js"
    data-site="your-site-id" async></script>';
});`,
  },
];

export function EmbedTabs() {
  const [activeId, setActiveId] = useState(SNIPPETS[0].id);
  const [copied, setCopied] = useState(false);

  const active = SNIPPETS.find((snippet) => snippet.id === activeId) ?? SNIPPETS[0];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(active.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl ring-1 ring-zinc-800">
      <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-800 px-2 pt-2">
        {SNIPPETS.map((snippet) => (
          <button
            key={snippet.id}
            type="button"
            onClick={() => setActiveId(snippet.id)}
            className={cn(
              "whitespace-nowrap rounded-t-lg px-3.5 py-2 text-xs font-medium transition-colors duration-150",
              snippet.id === activeId
                ? "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {snippet.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-800/50 px-4 py-2">
        <span className="font-mono text-[11px] text-zinc-500">{active.file}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-300 transition-colors duration-150 hover:bg-zinc-700 hover:text-white"
        >
          {copied ? (
            <>
              <CheckIcon className="h-3.5 w-3.5 text-green-400" />
              Copied
            </>
          ) : (
            <>
              <CopyIcon className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      <pre key={active.id} className="animate-slide-up-fade overflow-x-auto p-5 text-sm leading-relaxed">
        <code className="font-mono text-zinc-100">{active.code}</code>
      </pre>
    </div>
  );
}
