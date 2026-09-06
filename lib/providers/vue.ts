import { format } from "date-fns";

import {
  formatFromBlob,
  liveFilmFromTitle,
} from "@/lib/providers/scrape-utils";
import { fetchJson, fetchRaw, JSON_REVALIDATE_SECONDS } from "@/lib/providers/http";
import type { CinemaProvider, ProviderListings } from "@/lib/providers/types";
import type { Film, Screening, ScreeningQuery } from "@/lib/types";

const BASE = "https://www.myvue.com";
const CINEMA_IDS: Record<string, string> = {
  "10091": "vue-printworks",
  "10057": "vue-lowry",
};

interface VueAttribute {
  name?: string;
  shortName?: string;
  value?: string;
}

interface VueSession {
  sessionId: string;
  bookingUrl?: string;
  startTime?: string;
  showTimeWithTimeZone?: string;
  attributes?: VueAttribute[];
}

interface VueGroup {
  date?: string;
  sessions?: VueSession[];
}

interface VueFilm {
  filmId: string;
  filmTitle: string;
  filmUrl?: string;
  runningTime?: number;
  synopsisShort?: string;
  posterImageSrc?: string;
  releaseDate?: string;
  certificate?: { name?: string | null };
  genres?: string[];
  showingGroups?: VueGroup[];
}

interface VuePayload {
  responseCode?: number;
  result?: VueFilm[];
}

function cookieHeaderFromSetCookie(setCookie: string[]): string {
  const pairs: string[] = [];
  for (const line of setCookie) {
    const pair = line.split(";")[0]?.trim();
    if (pair?.includes("=")) pairs.push(pair);
  }
  const hasToken = pairs.some((pair) => pair.startsWith("microservicesToken="));
  return hasToken ? pairs.join("; ") : "";
}

function cookiesFromResponse(response: Response): string[] {
  if (typeof response.headers.getSetCookie === "function") {
    const listed = response.headers.getSetCookie();
    if (listed.length) return listed;
  }
  const joined = response.headers.get("set-cookie");
  return joined ? [joined] : [];
}

async function vueSessionCookie(): Promise<string> {
  // Token is only in Set-Cookie. Skip Next's data cache so the header is kept.
  const response = await fetchRaw(`${BASE}/cinema/manchester-printworks/whats-on`, {
    revalidate: 0,
    timeoutMs: 25_000,
    accept: "text/html,application/json,text/plain,*/*",
  });
  return cookieHeaderFromSetCookie(cookiesFromResponse(response));
}

async function loadCinema(externalId: string, cookie: string): Promise<VuePayload> {
  const url = `${BASE}/api/microservice/showings/cinemas/${externalId}/films?minEmbargoLevel=1&includesSession=true&includeSessionAttributes=true`;
  const options = {
    timeoutMs: 30_000,
    revalidate: cookie ? 0 : JSON_REVALIDATE_SECONDS,
    headers: cookie ? { Cookie: cookie } : undefined,
  };
  try {
    return await fetchJson<VuePayload>(url, options);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!cookie || !message.includes("401")) throw error;
    return fetchJson<VuePayload>(url, options);
  }
}

export class VueProvider implements CinemaProvider {
  id = "vue";

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

    let pages: VuePayload[];
    try {
      pages = await Promise.all(externalIds.map((id) => loadCinema(id, "")));
    } catch {
      const cookie = await vueSessionCookie();
      if (!cookie) throw new Error("Vue listings require a microservice session cookie");
      pages = await Promise.all(externalIds.map((id) => loadCinema(id, cookie)));
    }

    const from = format(query.from, "yyyy-MM-dd");
    const to = format(query.to, "yyyy-MM-dd");
    const filmsById = new Map<string, Film>();
    const screenings: Screening[] = [];

    pages.forEach((page, index) => {
      const cinemaId = CINEMA_IDS[externalIds[index]];
      for (const raw of page.result ?? []) {
        if (!raw.filmTitle || !raw.showingGroups?.length) continue;
        const year = raw.releaseDate ? Number.parseInt(raw.releaseDate.slice(0, 4), 10) : undefined;
        const attributes = (raw.showingGroups ?? []).flatMap((group) =>
          (group.sessions ?? []).flatMap((session) =>
            (session.attributes ?? []).map((item) => item.value || item.name || ""),
          ),
        );
        let film: Film | undefined;

        for (const group of raw.showingGroups) {
          for (const session of group.sessions ?? []) {
            const stamp = session.showTimeWithTimeZone || session.startTime || "";
            const date = stamp.slice(0, 10);
            const startTime = stamp.slice(11, 16);
            if (!date || !startTime || date < from || date > to) continue;
            film ??= liveFilmFromTitle(raw.filmTitle, {
              year,
              runtime: raw.runningTime,
              rating: raw.certificate?.name || "TBC",
              genres: raw.genres,
              posterUrl: raw.posterImageSrc
                ? raw.posterImageSrc.startsWith("http")
                  ? raw.posterImageSrc
                  : `${BASE}${raw.posterImageSrc}`
                : undefined,
              description: raw.synopsisShort,
              attributes,
            });
            filmsById.set(film.id, film);
            const formatBlob = (session.attributes ?? [])
              .map((item) => `${item.name ?? ""} ${item.value ?? ""}`)
              .join(" ");
            screenings.push({
              id: `vue-${session.sessionId}`,
              filmId: film.id,
              cinemaId,
              date,
              startTime,
              format: formatFromBlob(formatBlob),
              bookingUrl: session.bookingUrl
                ? session.bookingUrl.startsWith("http")
                  ? session.bookingUrl
                  : `${BASE}${session.bookingUrl}`
                : raw.filmUrl || BASE,
            });
          }
        }
      }
    });

    return { films: [...filmsById.values()], screenings };
  }
}
