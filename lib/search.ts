import Fuse from "fuse.js";

import { films as seedFilms } from "@/lib/data/films";
import { franchises } from "@/lib/data/franchises";
import type { Film, Franchise } from "@/lib/types";

export type SearchHit =
  | { type: "film"; item: Film; score: number }
  | { type: "franchise"; item: Franchise; score: number };

const franchiseIndex = new Fuse(franchises, {
  keys: ["name", "description"],
  threshold: 0.34,
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 2,
});

function uniqueFilms(liveFilms: Film[]): Film[] {
  const byId = new Map<string, Film>();
  for (const film of seedFilms) byId.set(film.id, film);
  for (const film of liveFilms) byId.set(film.id, film);
  return [...byId.values()];
}

export function searchCatalog(query: string, liveFilms: Film[] = [], limit = 12): SearchHit[] {
  const q = query.trim();
  if (q.length < 2) return [];

  const filmIndex = new Fuse(uniqueFilms(liveFilms), {
    keys: [
      { name: "title", weight: 0.7 },
      { name: "genres", weight: 0.15 },
      { name: "description", weight: 0.15 },
    ],
    threshold: 0.38,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 2,
  });

  const filmHits: SearchHit[] = filmIndex.search(q, { limit }).map((result) => ({
    type: "film",
    item: result.item,
    score: result.score ?? 1,
  }));

  const franchiseHits: SearchHit[] = franchiseIndex
    .search(q, { limit: 6 })
    .map((result) => ({
      type: "franchise",
      item: result.item,
      score: (result.score ?? 1) * 0.85,
    }));

  return [...franchiseHits, ...filmHits]
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}

export function bestSearchDestination(query: string, liveFilms: Film[] = []): string | null {
  const hits = searchCatalog(query, liveFilms, 6);
  if (hits.length === 0) return null;

  const top = hits[0];
  const strong = top.score < 0.08;

  if (top.type === "franchise" && (strong || hits.filter((h) => h.type === "film").length >= 2)) {
    return `/franchises/${top.item.id}`;
  }

  const filmHits = hits.filter((hit) => hit.type === "film");
  if (filmHits.length === 1 && filmHits[0].score < 0.25) {
    return `/films/${filmHits[0].item.id}`;
  }

  return `/search?q=${encodeURIComponent(query.trim())}`;
}
