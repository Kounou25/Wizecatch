"use client";

import { useEffect, useState } from "react";
import { getTestimonials } from "@/lib/i18n/content";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const avatarColors = [
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
];

/**
 * Seuil d'affichage.
 *
 * « Rejoignez 3 personnes » dessert le produit plus qu'il ne le sert : sous ce
 * seuil, le bloc entier disparaît. Mieux vaut pas de preuve sociale qu'une
 * preuve sociale qui souligne le manque d'utilisateurs.
 */
const MIN_USERS = 25;

type PublicStats = { users: number; reviews: number; sites: number };

/**
 * Preuve sociale du haut de page.
 *
 * Les nombres sont RÉELS, lus en base : ils grandissent seuls et ne mentent
 * jamais. Les visages sont ceux des témoignages déjà présents plus bas sur la
 * page — des personas illustratifs, en initiales colorées.
 *
 * Publier les vraies photos de profil des clients serait un autre sujet : ils
 * se sont inscrits à un outil de collecte d'avis, pas pour devenir le visage
 * de sa page d'accueil. Cela demanderait leur consentement explicite.
 */
export function SocialProof({ dict }: { dict: Dictionary }) {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/public/stats")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: PublicStats | null) => {
        if (!cancelled && data) setStats(data);
      })
      // Un échec ne doit pas casser la page d'accueil : le bloc reste masqué.
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats || stats.users < MIN_USERS) return null;

  const faces = getTestimonials(dict).slice(0, 7);
  const format = (value: number) => value.toLocaleString("en-US");

  const text = dict.hero.socialProof
    .replace("{users}", format(stats.users))
    .replace("{reviews}", format(stats.reviews));

  // Le texte porte deux nombres à mettre en valeur : on découpe sur eux plutôt
  // que d'injecter du HTML, pour que la traduction reste une simple chaîne.
  const parts = text.split(new RegExp(`(${format(stats.users)}|${format(stats.reviews)})`));

  return (
    <div className="mt-8 animate-slide-up-fade">
      <div className="flex items-center">
        {faces.map((testimonial, index) => (
          <span
            key={testimonial.id}
            style={{ zIndex: faces.length - index }}
            className={`-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-white first:ml-0 ${
              avatarColors[index % avatarColors.length]
            }`}
            title={testimonial.authorName}
          >
            {testimonial.authorName
              .split(" ")
              .slice(0, 2)
              .map((word) => word[0])
              .join("")}
          </span>
        ))}
      </div>

      <p className="mt-3 max-w-md text-sm text-zinc-500">
        {parts.map((part, index) =>
          part === format(stats.users) || part === format(stats.reviews) ? (
            <strong key={index} className="font-semibold text-purple-600">
              {part}
            </strong>
          ) : (
            part
          ),
        )}
      </p>
    </div>
  );
}
