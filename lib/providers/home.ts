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
import type { Film, Screening, ScreeningQuery } from "@/lib/types";

const SPEKTRIX = "https://system.spektrix.com/home/api/v3";
const HOME_CINEMA_ID = "home-manchester";
const HOME_WHATS_ON = "https://homemcr.org/whats-on";

interface SpektrixEvent {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  isOnSale?: boolean;
  firstInstanceDateTime?: string;
  lastInstanceDateTime?: string;
  attribute_Certificate?: string;
  attribute_EventCategory?: string;
  attribute_IlluminateEventType?: string;
  attribute_ShowType?: string;
}

interface SpektrixInstance {
  id: string;
  start: string;
  cancelled?: boolean;
  isOnSale?: boolean;
  attribute_Screen?: string;
}

function isCinemaEvent(event: SpektrixEvent): boolean {
  const showType = event.attribute_ShowType ?? "";
  const eventType = event.attribute_IlluminateEventType ?? "";
  if (["Theatre", "Exhibition", "Workshop", "Fees and Memberships"].includes(showType)) {
    return false;
  }
  return eventType === "Screening" || showType === "Film";
}

function stripTitle(name: string): string {
  return name.replace(/\s+\((u|pg|12a?|15|18)\)/i, "").replace(/\s+\+\s+q\s*&\s*a/i, "").trim();
}

function yearFromDescription(description: string | undefined): number | undefined {
  if (!description) return undefined;
  const match = description.match(/\b(19|20)\d{2}\b/);
  return match ? Number.parseInt(match[0], 10) : undefined;
}

function toFilm(event: SpektrixEvent): Film {
  const title = stripTitle(event.name);
  const year = yearFromDescription(event.description);
  const seed = matchSeedFilm(title, year);
  const isRerelease = seed?.isRerelease || isRereleaseTitle(event.name, [], year);
  const category = event.attribute_EventCategory;
  const live: Film = {
    id: seed?.id ?? slugifyTitle(title),
    title: seed?.title ?? title,
    releaseYear: year && year > 1880 ? year : (seed?.releaseYear ?? new Date().getFullYear()),
    runtime: event.duration || seed?.runtime || 0,
    rating: event.attribute_Certificate || seed?.rating || "TBC",
    genres: category ? [category] : (seed?.genres ?? []),
    posterUrl: event.imageUrl || event.thumbnailUrl || "",
    description: (event.description ?? "").replace(/\r\n/g, "\n").trim() || seed?.description || "",
    franchiseId: seed?.franchiseId,
    isRerelease,
    screeningKind: screeningKindFromSignals({
      title: event.name,
      isRerelease,
    }),
    posterPalette: seed?.posterPalette ?? paletteForTitle(title),
  };
  return mergeLiveFilm(live, seed);
}

export class HomeProvider implements CinemaProvider {
  id = "home";

  async getListings(query: ScreeningQuery): Promise<ProviderListings> {
    if (query.cinemaIds?.length && !query.cinemaIds.includes(HOME_CINEMA_ID)) {
      return { films: [], screenings: [] };
    }

    const from = format(query.from, "yyyy-MM-dd");
    const to = format(query.to, "yyyy-MM-dd");
    const events = await fetchJson<SpektrixEvent[]>(
      `${SPEKTRIX}/events?instanceStart_from=${from}&instanceStart_to=${to}&onSale=true`,
    );
    const cinemaEvents = events.filter(isCinemaEvent);
    const filmsByEvent = new Map<string, Film>();
    for (const event of cinemaEvents) {
      filmsByEvent.set(event.id, toFilm(event));
    }

    const instancePages = await mapPool(cinemaEvents, 6, async (event) => {
      try {
        const instances = await fetchJson<SpektrixInstance[]>(
          `${SPEKTRIX}/events/${event.id}/instances?start_from=${from}`,
        );
        return { eventId: event.id, instances };
      } catch {
        return { eventId: event.id, instances: [] as SpektrixInstance[] };
      }
    });

    const screenings: Screening[] = [];
    for (const page of instancePages) {
      const film = filmsByEvent.get(page.eventId);
      if (!film) continue;
      for (const instance of page.instances) {
        if (instance.cancelled) continue;
        const [date, time] = instance.start.split("T");
        if (date < from || date > to) continue;
        screenings.push({
          id: `home-${instance.id}`,
          filmId: film.id,
          cinemaId: HOME_CINEMA_ID,
          date,
          startTime: time.slice(0, 5),
          format: "Standard",
          bookingUrl: HOME_WHATS_ON,
        });
      }
    }

    return { films: [...filmsByEvent.values()], screenings };
  }
}
