"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "@/components/icons";

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
        <span className="text-xs font-medium text-zinc-400">HTML</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-300 transition-colors duration-150 hover:bg-zinc-800 hover:text-white"
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
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono text-zinc-100">{code}</code>
      </pre>
    </div>
  );
}
