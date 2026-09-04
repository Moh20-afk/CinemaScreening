import { getDay } from "date-fns";

import { getCinemaById } from "@/lib/data/cinemas";
import { getFilmById } from "@/lib/data/films";
import { distanceMiles } from "@/lib/geo";
import { combineDateTime, isEveningTime } from "@/lib/dates";
import type {
  Film,
  Screening,
  ScreeningFilters,
  TrackedItem,
} from "@/lib/types";

type FilmLookup = (id: string) => Film | undefined;

export function applyScreeningFilters(
  screenings: Screening[],
  filters: ScreeningFilters,
  options?: {
    userLocation?: { latitude: number; longitude: number } | null;
    trackedItems?: TrackedItem[];
    getFilm?: FilmLookup;
  },
): Screening[] {
  const getFilm = options?.getFilm ?? getFilmById;
  return screenings.filter((screening) => {
    const cinema = getCinemaById(screening.cinemaId);
    const film = getFilm(screening.filmId);
    if (!cinema?.enabled || !film) return false;

    if (filters.cinemaIds?.length && !filters.cinemaIds.includes(cinema.id)) {
      return false;
    }
    if (filters.chains?.length && !filters.chains.includes(cinema.chain)) {
      return false;
    }
    if (filters.formats?.length && !filters.formats.includes(screening.format)) {
      return false;
    }
    if (filters.genres?.length && !filters.genres.some((g) => film.genres.includes(g))) {
      return false;
    }
    if (filters.releaseType === "rerelease" && !film.isRerelease) return false;
    if (filters.releaseType === "new" && film.isRerelease) return false;

    if (filters.timeFrom && screening.startTime < filters.timeFrom) return false;
    if (filters.timeTo && screening.startTime > filters.timeTo) return false;

    if (filters.maxDistanceMiles && options?.userLocation) {
      const miles = distanceMiles(options.userLocation, cinema);
      if (miles > filters.maxDistanceMiles) return false;
    }

    if (filters.trackedOnly && options?.trackedItems) {
      const tracked = options.trackedItems.some((item) => {
        if (item.type === "film") return item.filmId === film.id;
        return item.franchiseId === film.franchiseId;
      });
      if (!tracked) return false;
    }

    return true;
  });
}

export function matchesTrackedPreferences(
  screening: Screening,
  item: TrackedItem,
  cinemaLocation?: { latitude: number; longitude: number },
  userLocation?: { latitude: number; longitude: number } | null,
): boolean {
  const formats = item.preferredFormats.filter((format) => format !== "Any");
  if (formats.length > 0 && !formats.includes(screening.format)) {
    return false;
  }

  if (item.preferredTimes === "evenings" && !isEveningTime(screening.startTime)) {
    return false;
  }
  if (item.preferredTimes === "weekends") {
    const weekday = getDay(combineDateTime(screening.date, screening.startTime));
    if (weekday !== 0 && weekday !== 6) return false;
  }

  if (
    item.radius !== "gm" &&
    cinemaLocation &&
    userLocation &&
    distanceMiles(userLocation, cinemaLocation) > item.radius
  ) {
    return false;
  }

  return true;
}

export function uniqueFilmsFromScreenings(
  screenings: Screening[],
  getFilm: FilmLookup = getFilmById,
): Film[] {
  const seen = new Set<string>();
  const result: Film[] = [];
  for (const screening of screenings) {
    if (seen.has(screening.filmId)) continue;
    const film = getFilm(screening.filmId);
    if (!film) continue;
    seen.add(film.id);
    result.push(film);
  }
  return result;
}

export function nextScreeningForFilm(
  screenings: Screening[],
  filmId: string,
): Screening | undefined {
  return screenings
    .filter((screening) => screening.filmId === filmId)
    .sort((a, b) =>
      `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`),
    )[0];
}

export function cinemaCountForFilm(screenings: Screening[], filmId: string): number {
  return new Set(
    screenings.filter((screening) => screening.filmId === filmId).map((s) => s.cinemaId),
  ).size;
}
