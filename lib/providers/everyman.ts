import { format } from "date-fns";

import {
  isRereleaseTitle,
  matchSeedFilm,
  mergeLiveFilm,
  paletteForTitle,
  screeningKindFromSignals,
  slugifyTitle,
} from "@/lib/film-identity";
import { fetchJson, mapPool } from "@/lib/providers/http";
import type { CinemaProvider, ProviderListings } from "@/lib/providers/types";
import type { Film, FilmFormat, Screening, ScreeningQuery } from "@/lib/types";

const BOXOFFICE = "https://www.everymancinema.com/api/gatsby-source-boxofficeapi";
const TIME_ZONE = "Europe/London";

const CINEMA_IDS: Record<string, string> = {
  X11NP: "everyman-st-johns",
  X11DP: "everyman-altrincham",
};

interface EverymanShowtime {
  id: string;
  startsAt: string;
  tags?: string[];
  isExpired?: boolean;
  data?: {
    ticketing?: Array<{ urls?: string[]; type?: string; provider?: string }>;
  };
}

interface EverymanScheduleBody {
  [theaterId: string]: {
    schedule?: Record<string, Record<string, EverymanShowtime[]>>;
  };
}

interface EverymanMovie {
  id: string;
  title: string;
  runtime?: number;
  genres?: string | string[];
  poster?: string;
  synopsis?: string;
  certificate?: string | { value?: string };
  release?: unknown;
  releases?: unknown;
}

function boxofficeUrl(
  path: string,
  query: Record<string, string | string[] | boolean | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else {
      params.set(key, String(value));
    }
  }
  return `${BOXOFFICE}/${path}?${params.toString()}`;
}

function yearFromUnknown(value: unknown): number | undefined {
  const match = JSON.stringify(value ?? "").match(/\b(19|20)\d{2}\b/);
  return match ? Number.parseInt(match[0], 10) : undefined;
}

function certificateOf(movie: EverymanMovie): string {
  const value = movie.certificate;
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value && typeof value === "object" && typeof value.value === "string") {
    return value.value.trim() || "TBC";
  }
  return "TBC";
}

function genresOf(movie: EverymanMovie): string[] {
  if (Array.isArray(movie.genres)) {
    return movie.genres.map((genre) => genre.trim()).filter(Boolean);
  }
  if (typeof movie.genres === "string") {
    return movie.genres
      .split(",")
      .map((genre) => genre.trim())
      .filter(Boolean);
  }
  return [];
}

function runtimeMinutes(runtime: number | undefined): number {
  if (!runtime) return 0;
  return runtime >= 600 ? Math.round(runtime / 60) : runtime;
}

function formatFromTags(tags: string[]): FilmFormat {
  const blob = tags.join(" ").toLowerCase();
  if (blob.includes("imax")) return "IMAX";
  if (blob.includes("4dx")) return "4DX";
  if (blob.includes("dolby")) return "Dolby";
  return "Standard";
}

function bookingUrl(show: EverymanShowtime, cinemaId: string): string {
  const tickets = show.data?.ticketing ?? [];
  const preferred =
    tickets.find((item) => item.provider === "default" && item.type === "DESKTOP") ??
    tickets.find((item) => item.type === "DESKTOP") ??
    tickets[0];
  const url = preferred?.urls?.[0];
  if (url) return url;
  const slug = cinemaId.replace("everyman-", "").replace("st-johns", "manchester-st-johns");
  return `https://www.everymancinema.com/${slug}`;
}

function toFilm(raw: EverymanMovie): Film {
  const year = yearFromUnknown(raw.release) ?? yearFromUnknown(raw.releases);
  const seed = matchSeedFilm(raw.title, year);
  const isRerelease = seed?.isRerelease || isRereleaseTitle(raw.title, [], year);
  const live: Film = {
    id: seed?.id ?? slugifyTitle(raw.title),
    title: seed?.title ?? raw.title,
    releaseYear: year && year > 1880 ? year : (seed?.releaseYear ?? new Date().getFullYear()),
    runtime: runtimeMinutes(raw.runtime) || seed?.runtime || 0,
    rating: certificateOf(raw) || seed?.rating || "TBC",
    genres: genresOf(raw).length ? genresOf(raw) : (seed?.genres ?? []),
    posterUrl: raw.poster || "",
    description: (raw.synopsis ?? "").trim() || seed?.description || "",
    franchiseId: seed?.franchiseId,
    isRerelease,
    screeningKind: screeningKindFromSignals({
      title: raw.title,
      isRerelease,
    }),
    posterPalette: seed?.posterPalette ?? paletteForTitle(raw.title),
  };
  return mergeLiveFilm(live, seed);
}

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages;
}

export class EverymanProvider implements CinemaProvider {
  id = "everyman";

  async getListings(query: ScreeningQuery): Promise<ProviderListings> {
    const wanted = new Set(
      (query.cinemaIds ?? Object.values(CINEMA_IDS)).filter((id) =>
        Object.values(CINEMA_IDS).includes(id),
      ),
    );
    const theaterIds = Object.entries(CINEMA_IDS)
      .filter(([, cinemaId]) => wanted.has(cinemaId))
      .map(([theaterId]) => theaterId);

    if (theaterIds.length === 0) return { films: [], screenings: [] };

    const from = format(query.from, "yyyy-MM-dd");
    const to = format(query.to, "yyyy-MM-dd");
    const schedule = await fetchJson<EverymanScheduleBody>(
      boxofficeUrl("schedule", {
        theaters: theaterIds.map((id) => JSON.stringify({ id, timeZone: TIME_ZONE })),
        from,
        to,
        includeAllMovies: true,
      }),
    );

    const movieIds = new Set<string>();
    for (const theaterId of theaterIds) {
      for (const movieId of Object.keys(schedule[theaterId]?.schedule ?? {})) {
        movieIds.add(movieId);
      }
    }

    if (movieIds.size === 0) return { films: [], screenings: [] };

    const moviePages = await mapPool(chunk([...movieIds], 40), 3, async (ids) => {
      try {
        return await fetchJson<EverymanMovie[]>(boxofficeUrl("movies", { ids }));
      } catch {
        return [] as EverymanMovie[];
      }
    });

    const filmsByExternal = new Map<string, Film>();
    for (const movie of moviePages.flat()) {
      if (movie?.id && movie.title) {
        filmsByExternal.set(movie.id, toFilm(movie));
      }
    }

    const screenings: Screening[] = [];
    for (const theaterId of theaterIds) {
      const cinemaId = CINEMA_IDS[theaterId];
      const movies = schedule[theaterId]?.schedule ?? {};
      for (const [movieId, days] of Object.entries(movies)) {
        const film = filmsByExternal.get(movieId);
        if (!film) continue;
        for (const [date, shows] of Object.entries(days)) {
          if (date < from || date > to) continue;
          for (const show of shows) {
            if (show.isExpired) continue;
            const startsAt = show.startsAt.includes("T") ? show.startsAt : `${date}T${show.startsAt}`;
            const time = startsAt.split("T")[1]?.slice(0, 5);
            if (!time) continue;
            screenings.push({
              id: `everyman-${show.id}`,
              filmId: film.id,
              cinemaId,
              date,
              startTime: time,
              format: formatFromTags(show.tags ?? []),
              bookingUrl: bookingUrl(show, cinemaId),
            });
          }
        }
      }
    }

    return { films: [...filmsByExternal.values()], screenings };
  }
}
