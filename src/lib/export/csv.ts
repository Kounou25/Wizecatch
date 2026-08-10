/**
 * Génération de CSV.
 *
 * Deux pièges traités ici, invisibles tant qu'on ne les rencontre pas :
 *
 * 1. L'ÉCHAPPEMENT. Un avis contient très souvent une virgule, un guillemet ou
 *    un retour à la ligne. Sans guillemets doublés, le fichier se décale d'une
 *    colonne et devient illisible — sur les lignes concernées seulement, donc
 *    le défaut passe inaperçu à la relecture rapide.
 *
 * 2. L'INJECTION DE FORMULE. Une cellule qui commence par « = », « + », « - »
 *    ou « @ » est interprétée comme une formule par Excel et Google Sheets. Un
 *    visiteur peut donc laisser un avis contenant `=HYPERLINK(...)` qui
 *    s'exécutera chez le client à l'ouverture du fichier. On neutralise en
 *    préfixant d'une apostrophe, convention reconnue par les tableurs.
 */

const RISKY_PREFIX = /^[=+\-@\t\r]/;

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";

  let text = String(value);

  if (RISKY_PREFIX.test(text)) text = `'${text}`;

  // On guillemette dès qu'un séparateur, un guillemet ou un saut de ligne
  // apparaît. Les guillemets internes sont doublés, comme le veut le RFC 4180.
  if (/[",\r\n]/.test(text)) {
    text = `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(escapeCell).join(",")];

  for (const row of rows) {
    lines.push(row.map(escapeCell).join(","));
  }

  // CRLF : attendu par le RFC et par Excel sous Windows.
  // Le BOM force Excel à lire l'UTF-8 ; sans lui, les accents sortent en
  // « CafÃ© » sur une installation française.
  return "﻿" + lines.join("\r\n");
}

/** Nom de fichier lisible et trié naturellement par date. */
export function exportFilename(kind: string, domain: string): string {
  const slug = domain.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const day = new Date().toISOString().slice(0, 10);
  return `wizecatch-${kind}-${slug}-${day}.csv`;
}
