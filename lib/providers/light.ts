import { format } from "date-fns";

import {
  compactDateToIso,
  displayTimeToHhMm,
  formatFromBlob,
  liveFilmFromTitle,
  parseEmbeddedJsonObject,
  runtimeFromLabel,
} from "@/lib/providers/scrape-utils";
import { fetchText, SCRAPE_REVALIDATE_SECONDS } from "@/lib/providers/http";
import type { CinemaProvider, ProviderListings } from "@/lib/providers/types";
import type { Film, Screening, ScreeningQuery } from "@/lib/types";

const CINEMA_ID = "light-stockport";
const BASE = "https://stockport.thelight.co.uk";

interface LightSession {
  BOID?: string;
  Display?: string;
  Url?: string;
  CssClass?: string;
  FormatDisplay?: string;
  Collections?: Array<{ Title?: string }>;
}

interface LightDate {
  Key: string;
  Sessions?: LightSession[];
}

interface LightProgramme {
  ID: number | string;
  CssClass?: string;
  Title: string;
  Url?: string;
  Cert?: string;
  Runtime?: string;
  Summary?: string;
  Dates?: LightDate[];
}

interface LightGuide {
  Schedule?: LightProgramme[];
}

export class LightProvider implements CinemaProvider {
  id = "light";

  async getListings(query: ScreeningQuery): Promise<ProviderListings> {
    if (query.cinemaIds?.length && !query.cinemaIds.includes(CINEMA_ID)) {
      return { films: [], screenings: [] };
    }

    const stamp = `${format(new Date(), "yyyyMMdd")}0000`;
    const source = await fetchText(`${BASE}/resource/services/miniguide/data.ashx?d=${stamp}`, {
      revalidate: SCRAPE_REVALIDATE_SECONDS,
    });
    const guide = parseEmbeddedJsonObject<LightGuide>(source);
    const from = format(query.from, "yyyy-MM-dd");
    const to = format(query.to, "yyyy-MM-dd");

    const filmsById = new Map<string, Film>();
    const screenings: Screening[] = [];

    for (const programme of guide.Schedule ?? []) {
      if (!/film/i.test(programme.CssClass ?? "")) continue;
      if (!programme.Title || !programme.Dates?.length) continue;
      const film = liveFilmFromTitle(programme.Title, {
        runtime: runtimeFromLabel(programme.Runtime),
        rating: programme.Cert || "TBC",
        description: programme.Summary,
      });
      filmsById.set(film.id, film);

      for (const day of programme.Dates) {
        const date = compactDateToIso(day.Key);
        if (!date || date < from || date > to) continue;
        for (const session of day.Sessions ?? []) {
          const startTime = displayTimeToHhMm(session.Display ?? "");
          if (!startTime) continue;
          const formatBlob = `${session.FormatDisplay ?? ""} ${(session.Collections ?? [])
            .map((item) => item.Title ?? "")
            .join(" ")}`;
          screenings.push({
            id: `light-${session.BOID || `${programme.ID}-${date}-${startTime}`}`,
            filmId: film.id,
            cinemaId: CINEMA_ID,
            date,
            startTime,
            format: formatFromBlob(formatBlob),
            bookingUrl: session.Url
              ? session.Url.startsWith("http")
                ? session.Url
                : `${BASE}${session.Url}`
              : `${BASE}${programme.Url ?? "/cinema"}`,
          });
        }
      }
    }

    return { films: [...filmsById.values()], screenings };
  }
}
