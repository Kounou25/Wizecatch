"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type Snippet = {
  id: string;
  label: string;
  file: string;
  /** Certaines plateformes se pilotent à la souris : on donne des étapes. */
  steps?: string[];
  code: string;
};

/**
 * Exemples d'intégration par technologie, avec la vraie clé du site.
 *
 * Chaque exemple montre les deux morceaux : le script (obligatoire) et la
 * balise du mur d'avis (optionnelle). C'est la question qui revient le plus,
 * autant y répondre dans le même bloc.
 */
export function SiteEmbedTabs({
  siteKey,
  origin,
  showWall,
}: {
  siteKey: string;
  origin: string;
  /** Le mur d'avis n'a de sens qu'en mode Reviews. */
  showWall: boolean;
}) {
  const scriptTag = `<script src="${origin}/w.js" data-site="${siteKey}" async></script>`;
  const wallTag = `<div data-wizecatch-wall></div>`;

  const snippets: Snippet[] = [
    {
      id: "html",
      label: "HTML",
      file: "index.html",
      code: `<body>
  <!-- your page content -->
${showWall ? `\n  <!-- Where your reviews appear -->\n  ${wallTag}\n` : ""}
  ${scriptTag}
</body>`,
    },
    {
      id: "nextjs",
      label: "Next.js",
      file: "app/layout.tsx",
      code: `import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
${showWall ? `        {/* Where your reviews appear */}\n        <div data-wizecatch-wall />\n` : ""}
        <Script
          src="${origin}/w.js"
          data-site="${siteKey}"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}`,
    },
    {
      id: "react",
      label: "React",
      file: "App.jsx",
      code: `import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "${origin}/w.js";
    s.dataset.site = "${siteKey}";
    s.async = true;
    document.body.appendChild(s);
    return () => s.remove();
  }, []);

  return (
    <>
      {/* your app */}
${showWall ? `      {/* Where your reviews appear */}\n      <div data-wizecatch-wall />\n` : ""}    </>
  );
}`,
    },
    {
      id: "vue",
      label: "Vue",
      file: "App.vue",
      code: `<script setup>
import { onMounted } from "vue";

onMounted(() => {
  const s = document.createElement("script");
  s.src = "${origin}/w.js";
  s.dataset.site = "${siteKey}";
  s.async = true;
  document.body.appendChild(s);
});
</script>

<template>
  <!-- your app -->
${showWall ? `  <!-- Where your reviews appear -->\n  <div data-wizecatch-wall></div>\n` : ""}</template>`,
    },
    {
      id: "wordpress",
      label: "WordPress",
      file: "functions.php",
      steps: [
        "Appearance → Theme File Editor → functions.php",
        showWall
          ? "For the reviews wall, add a Custom HTML block with the div below"
          : "",
      ].filter(Boolean),
      code: `add_action('wp_footer', function () {
  echo '${scriptTag.replace(/'/g, "\\'")}';
});
${showWall ? `\n// Then place this in any page, via a Custom HTML block:\n// ${wallTag}` : ""}`,
    },
    {
      id: "nocode",
      label: "No-code",
      file: "Webflow · Squarespace · Shopify · Framer",
      steps: [
        "Webflow — Project Settings → Custom Code → Footer Code",
        "Squarespace — Settings → Advanced → Code Injection → Footer",
        "Shopify — Online Store → Themes → Edit code → theme.liquid, before </body>",
        "Framer — Site Settings → General → Custom Code → End of <body>",
        showWall
          ? "Then add an Embed / Custom HTML block where you want the reviews, containing the div below"
          : "",
      ].filter(Boolean),
      code: `${scriptTag}${showWall ? `\n\n${wallTag}` : ""}`,
    },
  ];

  const [activeId, setActiveId] = useState(snippets[0].id);
  const [copied, setCopied] = useState(false);

  const active = snippets.find((snippet) => snippet.id === activeId) ?? snippets[0];

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
    <div className="overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-800">
      <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-800 px-2 pt-2">
        {snippets.map((snippet) => (
          <button
            key={snippet.id}
            type="button"
            onClick={() => {
              setActiveId(snippet.id);
              setCopied(false);
            }}
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
        <span className="truncate font-mono text-[11px] text-zinc-500">{active.file}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="ml-3 inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-300 transition-colors duration-150 hover:bg-zinc-700 hover:text-white"
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

      {active.steps && active.steps.length > 0 && (
        <ol className="space-y-1 border-b border-zinc-800 px-4 py-3 text-xs text-zinc-400">
          {active.steps.map((step) => (
            <li key={step} className="flex gap-2">
              <span className="text-zinc-600">→</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      )}

      <pre key={active.id} className="animate-slide-up-fade overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono text-zinc-100">{active.code}</code>
      </pre>
    </div>
  );
}
