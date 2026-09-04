import { films as seedFilms } from "@/lib/data/films";
import type { Film, FilmFormat, PosterPalette, ScreeningKind } from "@/lib/types";

const PALETTES: PosterPalette[] = [
  { from: "#1c1917", to: "#7f1d1d", accent: "#f5d0c5" },
  { from: "#0f172a", to: "#1e3a5f", accent: "#f8fafc" },
  { from: "#14532d", to: "#052e16", accent: "#bbf7d0" },
  { from: "#3b0764", to: "#1e1b4b", accent: "#e9d5ff" },
  { from: "#431407", to: "#7c2d12", accent: "#fdba74" },
  { from: "#111827", to: "#be123c", accent: "#fecdd3" },
];

const CERTIFICATE_RE = /\((u|pg|12a?|15|18|r18)\)/gi;
const NOISE_RE =
  /\b(\d+(st|nd|rd|th)\s+anniversary|anniversary|encore|re-?release|classic|special presentation|extended cut|director'?s cut)\b/gi;

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(CERTIFICATE_RE, " ")
    .replace(NOISE_RE, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\bthe\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugifyTitle(title: string): string {
  const slug = normalizeTitle(title).replace(/\s+/g, "-").slice(0, 80);
  return slug || "film";
}

function tokenSet(title: string): Set<string> {
  return new Set(normalizeTitle(title).split(" ").filter(Boolean));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const token of a) if (b.has(token)) inter += 1;
  return inter / (a.size + b.size - inter);
}

export function titleSimilarity(a: string, b: string): number {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.length >= 8 && nb.length >= 8 && (na.includes(nb) || nb.includes(na))) {
    return 0.9;
  }
  return jaccard(tokenSet(a), tokenSet(b));
}

export function matchSeedFilm(title: string, year?: number): Film | undefined {
  let best: { film: Film; score: number } | undefined;
  for (const film of seedFilms) {
    let score = titleSimilarity(title, film.title);
    if (year && film.releaseYear) {
      const delta = Math.abs(year - film.releaseYear);
      if (delta > 2 && score < 0.8) continue;
      if (delta === 0) score += 0.02;
    }
    if (!best || score > best.score) best = { film, score };
  }
  if (best && best.score >= 0.72) return best.film;
  return undefined;
}

export function paletteForTitle(title: string): PosterPalette {
  let hash = 0;
  for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PALETTES[hash % PALETTES.length];
}

export function formatFromAttributes(ids: string[]): FilmFormat {
  const set = new Set(ids.map((id) => id.toLowerCase()));
  if (set.has("imax") || set.has("imax3d")) return "IMAX";
  if (set.has("4dx")) return "4DX";
  if (set.has("dolby") || set.has("dolby-cinema") || set.has("atmos")) return "Dolby";
  return "Standard";
}

export function ratingFromAttributes(ids: string[], fallback = "TBC"): string {
  const set = new Set(ids.map((id) => id.toLowerCase()));
  for (const rating of ["r18", "18", "15", "12a", "12", "pg", "u"]) {
    if (set.has(rating)) return rating.toUpperCase() === "U" ? "U" : rating.toUpperCase();
  }
  return fallback;
}

const GENRE_LABELS: Record<string, string> = {
  action: "Action",
  adventure: "Adventure",
  animation: "Animation",
  comedy: "Comedy",
  crime: "Crime",
  documentary: "Documentary",
  drama: "Drama",
  family: "Family",
  fantasy: "Fantasy",
  horror: "Horror",
  musical: "Musical",
  mystery: "Mystery",
  romance: "Romance",
  scifi: "Sci-Fi",
  "sci-fi": "Sci-Fi",
  thriller: "Thriller",
  war: "War",
  western: "Western",
};

export function genresFromAttributes(ids: string[]): string[] {
  const genres = ids
    .map((id) => GENRE_LABELS[id.toLowerCase()])
    .filter((label): label is string => Boolean(label));
  return [...new Set(genres)];
}

export function screeningKindFromSignals(input: {
  title: string;
  attributes?: string[];
  isRerelease: boolean;
}): ScreeningKind {
  const blob = `${input.title} ${(input.attributes ?? []).join(" ")}`.toLowerCase();
  if (/\bq\s*&\s*a\b|\bqa\b/.test(blob)) return "special";
  if (/\bmarathon\b/.test(blob)) return "marathon";
  if (/\banniversary\b/.test(blob)) return "anniversary";
  if (/\bclassicfilm\b|\bclassic\b|\bretrospective\b/.test(blob)) return "classic";
  if (input.isRerelease) return "rerelease";
  return "standard";
}

export function isRereleaseTitle(title: string, attributes: string[], releaseYear?: number): boolean {
  const blob = `${title} ${attributes.join(" ")}`.toLowerCase();
  if (/\bclassicfilm\b|\bclassic\b|\banniversary\b|\bencore\b|\bre-?release\b/.test(blob)) {
    return true;
  }
  if (releaseYear && releaseYear <= new Date().getFullYear() - 2) return true;
  return false;
}

export function mergeLiveFilm(live: Film, seed?: Film): Film {
  if (!seed) return live;
  return {
    ...seed,
    title: live.title.length > seed.title.length ? seed.title : live.title,
    runtime: live.runtime || seed.runtime,
    rating: live.rating !== "TBC" ? live.rating : seed.rating,
    genres: live.genres.length ? live.genres : seed.genres,
    posterUrl: live.posterUrl || seed.posterUrl,
    description: live.description || seed.description,
    isRerelease: seed.isRerelease || live.isRerelease,
    screeningKind:
      seed.screeningKind !== "standard" ? seed.screeningKind : live.screeningKind,
    posterPalette: live.posterUrl ? live.posterPalette : seed.posterPalette,
  };
}
