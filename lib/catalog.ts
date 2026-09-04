import { differenceInCalendarDays, parseISO } from "date-fns";

import { getFilmById as getSeedFilmById } from "@/lib/data/films";
import { getEnabledCinemas, getCinemaById } from "@/lib/data/cinemas";
import { franchises, getFranchiseById } from "@/lib/data/franchises";
import { mergeLiveFilm } from "@/lib/film-identity";
import { getListingsFromProviders } from "@/lib/providers";
import { getPosterUrl, searchTmdbMovie, tmdbPosterUrl } from "@/lib/tmdb";
import { mapPool } from "@/lib/providers/http";
import type { Film, ListingsPayload, ScreeningQuery } from "@/lib/types";

export function queryFromRange(
  range: { from: Date; to: Date },
  cinemaIds?: string[],
): ScreeningQuery {
  return { from: range.from, to: range.to, cinemaIds };
}

function mergeFilms(films: Film[]): Film[] {
  const byId = new Map<string, Film>();
  for (const film of films) {
    const existing = byId.get(film.id);
    byId.set(film.id, existing ? mergeLiveFilm(film, existing) : film);
  }
  return [...byId.values()].map((film) => {
    if (film.posterUrl) return film;
    const seeded = getPosterUrl(film.id);
    return seeded ? { ...film, posterUrl: seeded } : film;
  });
}

async function enrichWithTmdb(films: Film[]): Promise<Film[]> {
  if (!process.env.TMDB_API_KEY) return films;
  return mapPool(films, 4, async (film) => {
    if (film.posterUrl && film.description) return film;
    const hit = await searchTmdbMovie(film.title, film.releaseYear);
    if (!hit) return film;
    return {
      ...film,
      posterUrl: film.posterUrl || tmdbPosterUrl(hit.posterPath),
      description: film.description || hit.overview,
      releaseYear: film.releaseYear || hit.year || film.releaseYear,
    };
  });
}

export async function loadListings(query: ScreeningQuery): Promise<ListingsPayload> {
  const { listings, sources } = await getListingsFromProviders(query);
  const merged = mergeFilms(listings.films);
  const films = await enrichWithTmdb(merged);
  const knownIds = new Set(films.map((film) => film.id));
  const screenings = listings.screenings
    .filter((screening) => knownIds.has(screening.filmId))
    .sort((a, b) =>
      `${a.date}${a.startTime}${a.cinemaId}`.localeCompare(
        `${b.date}${b.startTime}${b.cinemaId}`,
      ),
    );

  return {
    films,
    screenings,
    fetchedAt: new Date().toISOString(),
    sources,
  };
}

export function emptyListings(): ListingsPayload {
  return {
    films: [],
    screenings: [],
    fetchedAt: new Date().toISOString(),
    sources: [],
  };
}

export function resolveFilm(id: string, liveFilms: Film[]): Film | undefined {
  return liveFilms.find((film) => film.id === id) ?? getSeedFilmById(id);
}

export function parseListingsQuery(from: string, to: string): ScreeningQuery | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return null;
  }
  const start = parseISO(from);
  const end = parseISO(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return null;
  }
  if (differenceInCalendarDays(end, start) > 40) {
    return null;
  }
  return { from: start, to: end };
}

export {
  franchises,
  getCinemaById,
  getEnabledCinemas,
  getFranchiseById,
  getSeedFilmById as getFilmById,
};
