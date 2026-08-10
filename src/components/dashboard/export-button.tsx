"use client";

import { useState } from "react";
import { DownloadIcon, LoaderIcon } from "@/components/icons";

/**
 * Téléchargement de l'export CSV.
 *
 * Un simple lien aurait suffi pour le cas passant, mais pas pour l'échec : un
 * compte gratuit reçoit un 402 et le navigateur afficherait un JSON brut à la
 * place du fichier. On passe donc par fetch pour intercepter la réponse et
 * expliquer ce qui bloque.
 */
export function ExportButton({
  siteId,
  type,
  label,
  labels,
}: {
  siteId: string;
  type: "reviews" | "visits";
  label: string;
  labels: { pending: string; upgrade: string; failed: string };
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/export?siteId=${encodeURIComponent(siteId)}&type=${type}`,
      );

      if (response.status === 402) {
        setError(labels.upgrade);
        return;
      }
      if (!response.ok) {
        setError(labels.failed);
        return;
      }

      // Le nom du fichier est décidé par le serveur : on le relit dans
      // l'en-tête plutôt que de le reconstruire ici et risquer l'écart.
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const name = /filename="([^"]+)"/.exec(disposition)?.[1] ?? "wizecatch.csv";

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      link.click();

      // Sans révocation, le blob reste en mémoire jusqu'au rechargement.
      URL.revokeObjectURL(url);
    } catch {
      setError(labels.failed);
    } finally {
      setPending(false);
    }
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={download}
        disabled={pending}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-sm font-medium text-zinc-700 ring-1 ring-inset ring-zinc-300 transition-colors duration-150 hover:bg-zinc-50 disabled:opacity-60"
      >
        {pending ? (
          <LoaderIcon className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <DownloadIcon className="h-3.5 w-3.5" />
        )}
        {pending ? labels.pending : label}
      </button>

      {error && <span className="text-xs text-red-500">{error}</span>}
    </span>
  );
}
