import { format } from "date-fns";

import { liveFilmFromTitle, parseMonthDayTime } from "@/lib/providers/scrape-utils";
import { fetchText, mapPool, SCRAPE_REVALIDATE_SECONDS } from "@/lib/providers/http";
import type { CinemaProvider, ProviderListings } from "@/lib/providers/types";
import type { Film, Screening, ScreeningQuery } from "@/lib/types";

const CINEMA_ID = "northern-light-stretford";
const BASE = "https://www.tnlcinemastretford.co.uk";

function movieUrlsFromSitemap(xml: string): string[] {
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  return [...new Set(locs.filter((url) => /\/movie\/[^/]+\/?$/.test(url)))];
}

function parseMoviePage(html: string, pageUrl: string) {
  const heading = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map((match) => match[1].replace(/<[^>]+>/g, "").trim())
    .find((text) => text && !/^showtimes$/i.test(text));
  const ogTitle = html.match(/property="og:title"[^>]*content="([^"]+)"/i)?.[1];
  const title = heading || ogTitle;
  const poster =
    html.match(/itemprop="image"[^>]*href="([^"]+)"/i)?.[1] ||
    html.match(/property="og:image"[^>]*content="([^"]+)"/i)?.[1];
  const shows = [...html.matchAll(/href="([^"]*\/checkout\/showing\/[^"]+)"[^>]*>([^<]+)</gi)].map(
    (match) => ({
      bookingUrl: match[1].startsWith("http") ? match[1] : `${BASE}${match[1]}`,
      label: match[2].trim(),
    }),
  );
  return { title, poster, shows, pageUrl };
}

export class NorthernLightProvider implements CinemaProvider {
  id = "northern-light";

  async getListings(query: ScreeningQuery): Promise<ProviderListings> {
    if (query.cinemaIds?.length && !query.cinemaIds.includes(CINEMA_ID)) {
      return { films: [], screenings: [] };
    }

    const sitemap = await fetchText(`${BASE}/sitemap.xml`, {
      revalidate: SCRAPE_REVALIDATE_SECONDS,
      accept: "application/xml,text/xml,*/*",
    });
    const movieUrls = movieUrlsFromSitemap(sitemap);
    const pages = await mapPool(movieUrls, 6, async (url) => {
      try {
        const html = await fetchText(url, { revalidate: SCRAPE_REVALIDATE_SECONDS });
        return parseMoviePage(html, url);
      } catch {
        return parseMoviePage("", url);
      }
    });

    const from = format(query.from, "yyyy-MM-dd");
    const to = format(query.to, "yyyy-MM-dd");
    const filmsById = new Map<string, Film>();
    const screenings: Screening[] = [];

    for (const page of pages) {
      if (!page.title || page.shows.length === 0) continue;
      const film = liveFilmFromTitle(page.title, { posterUrl: page.poster });
      filmsById.set(film.id, film);
      for (const show of page.shows) {
        const parsed = parseMonthDayTime(show.label);
        if (!parsed || parsed.date < from || parsed.date > to) continue;
        const showingId = show.bookingUrl.match(/\/(\d+)\/?$/)?.[1] ?? `${parsed.date}-${parsed.startTime}`;
        screenings.push({
          id: `northern-light-${showingId}`,
          filmId: film.id,
          cinemaId: CINEMA_ID,
          date: parsed.date,
          startTime: parsed.startTime,
          format: "Standard",
          bookingUrl: show.bookingUrl,
        });
      }
    }

    return { films: [...filmsById.values()], screenings };
  }
}
