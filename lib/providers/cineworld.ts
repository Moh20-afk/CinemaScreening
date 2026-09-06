import { eachDayOfInterval, format } from "date-fns";

import {
  formatFromAttributes,
  genresFromAttributes,
  isRereleaseTitle,
  matchSeedFilm,
  mergeLiveFilm,
  paletteForTitle,
  ratingFromAttributes,
  screeningKindFromSignals,
  slugifyTitle,
} from "@/lib/film-identity";
import { fetchJson, mapPool } from "@/lib/providers/http";
import type { CinemaProvider, ProviderListings } from "@/lib/providers/types";
import type { Film, Screening, ScreeningQuery } from "@/lib/types";

const QUICKBOOK = "https://www.cineworld.co.uk/uk/data-api-service/v1/quickbook/10108";

const CINEMA_IDS: Record<string, string> = {
  "032": "cineworld-bolton",
  "051": "cineworld-didsbury",
  "068": "cineworld-ashton",
  "115": "cineworld-warrington",
};

interface CineworldFilm {
  id: string;
  name: string;
  length: number | null;
  posterLink: string | null;
  link: string | null;
  releaseYear: string | null;
  attributeIds?: string[];
}

interface CineworldEvent {
  id: string;
  filmId: string;
  cinemaId: string;
  businessDay: string;
  eventDateTime: string;
  attributeIds?: string[];
  bookingLink?: string | null;
}

interface FilmEventsBody {
  body: {
    films: CineworldFilm[];
    events: CineworldEvent[];
  };
}

function posterUrl(url: string | null): string {
  return url ?? "";
}

function toFilm(raw: CineworldFilm): Film {
  const year = raw.releaseYear ? Number.parseInt(raw.releaseYear, 10) : undefined;
  const attributes = raw.attributeIds ?? [];
  const seed = matchSeedFilm(raw.name, Number.isFinite(year) ? year : undefined);
  const isRerelease = seed?.isRerelease || isRereleaseTitle(raw.name, attributes, year);
  const live: Film = {
    id: seed?.id ?? slugifyTitle(raw.name),
    title: seed?.title ?? raw.name.replace(/\s+\((u|pg|12a?|15|18)\)$/i, "").trim(),
    releaseYear: year && year > 1880 ? year : (seed?.releaseYear ?? new Date().getFullYear()),
    runtime: raw.length || seed?.runtime || 0,
    rating: ratingFromAttributes(attributes, seed?.rating ?? "TBC"),
    genres: genresFromAttributes(attributes).length
      ? genresFromAttributes(attributes)
      : (seed?.genres ?? []),
    posterUrl: posterUrl(raw.posterLink),
    description: seed?.description ?? "",
    franchiseId: seed?.franchiseId,
    isRerelease,
    screeningKind: screeningKindFromSignals({
      title: raw.name,
      attributes,
      isRerelease,
    }),
    posterPalette: seed?.posterPalette ?? paletteForTitle(raw.name),
  };
  return mergeLiveFilm(live, seed);
}

function toScreening(
  event: CineworldEvent,
  filmId: string,
  filmAttributes: string[],
): Screening | null {
  const cinemaId = CINEMA_IDS[event.cinemaId];
  if (!cinemaId) return null;
  const start = event.eventDateTime.includes("T")
    ? event.eventDateTime
    : `${event.businessDay}T${event.eventDateTime}`;
  const [, timePart] = start.split("T");
  const startTime = timePart.slice(0, 5);
  return {
    id: `cineworld-${event.id}`,
    filmId,
    cinemaId,
    date: event.businessDay,
    startTime,
    format: formatFromAttributes([...(event.attributeIds ?? []), ...filmAttributes]),
    bookingUrl:
      event.bookingLink ||
      `https://www.cineworld.co.uk/cinemas/${cinemaId.replace("cineworld-", "")}`,
  };
}

export class CineworldProvider implements CinemaProvider {
  id = "cineworld";

  async getListings(query: ScreeningQuery): Promise<ProviderListings> {
    const wanted = new Set(
      (query.cinemaIds ?? Object.values(CINEMA_IDS)).filter((id) =>
        Object.values(CINEMA_IDS).includes(id),
      ),
    );
    const externalIds = Object.entries(CINEMA_IDS)
      .filter(([, cinemaId]) => wanted.has(cinemaId))
      .map(([external]) => external);

    if (externalIds.length === 0) return { films: [], screenings: [] };

    const days = eachDayOfInterval({ start: query.from, end: query.to }).map((day) =>
      format(day, "yyyy-MM-dd"),
    );

    const jobs = externalIds.flatMap((cinema) => days.map((date) => ({ cinema, date })));
    let okCount = 0;
    let lastError = "";
    const pages = await mapPool(jobs, 4, async ({ cinema, date }) => {
      try {
        const page = await fetchJson<FilmEventsBody>(
          `${QUICKBOOK}/film-events/in-cinema/${cinema}/at-date/${date}?attr=&lang=en_GB`,
          {
            headers: {
              Referer: "https://www.cineworld.co.uk/",
            },
          },
        );
        okCount += 1;
        return page;
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Cineworld request failed";
        return { body: { films: [], events: [] } };
      }
    });
    if (okCount === 0) {
      throw new Error(lastError || "Cineworld listings are blocked");
    }

    const filmsByExternal = new Map<string, Film>();
    const filmAttrs = new Map<string, string[]>();
    const screenings: Screening[] = [];

    for (const page of pages) {
      for (const film of page.body.films ?? []) {
        if (!filmsByExternal.has(film.id)) {
          filmsByExternal.set(film.id, toFilm(film));
          filmAttrs.set(film.id, film.attributeIds ?? []);
        }
      }
      for (const event of page.body.events ?? []) {
        const film = filmsByExternal.get(event.filmId);
        if (!film) continue;
        const screening = toScreening(event, film.id, filmAttrs.get(event.filmId) ?? []);
        if (screening) screenings.push(screening);
      }
    }

    return { films: [...filmsByExternal.values()], screenings };
  }
}
