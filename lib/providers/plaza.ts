import { format } from "date-fns";

import { liveFilmFromTitle, parseUkEventDateTimes } from "@/lib/providers/scrape-utils";
import { fetchText, SCRAPE_REVALIDATE_SECONDS } from "@/lib/providers/http";
import type { CinemaProvider, ProviderListings } from "@/lib/providers/types";
import type { Film, Screening, ScreeningQuery } from "@/lib/types";

const CINEMA_ID = "stockport-plaza";
const LISTINGS_URL = "https://stockportplaza.co.uk/whats-on/type/film/";

function parsePlazaTitle(raw: string): { title: string; rating: string } {
  let title = raw.replace(/^Film:\s*/i, "").trim();
  const cert = title.match(/\(\s*Cert\s+([^)]+)\)\s*$/i);
  let rating = "TBC";
  if (cert && cert.index !== undefined) {
    title = title.slice(0, cert.index).trim();
    rating = cert[1].replace(/\bTBC\b/gi, "").replace(/\s+/g, " ").trim() || "TBC";
  }
  return { title, rating };
}

export class PlazaProvider implements CinemaProvider {
  id = "plaza";

  async getListings(query: ScreeningQuery): Promise<ProviderListings> {
    if (query.cinemaIds?.length && !query.cinemaIds.includes(CINEMA_ID)) {
      return { films: [], screenings: [] };
    }

    const html = await fetchText(LISTINGS_URL, { revalidate: SCRAPE_REVALIDATE_SECONDS });
    const from = format(query.from, "yyyy-MM-dd");
    const to = format(query.to, "yyyy-MM-dd");
    const filmsById = new Map<string, Film>();
    const screenings: Screening[] = [];

    const blocks = html.split('class="event box-shadow"').slice(1);
    for (const block of blocks) {
      const rawTitle = block.match(/<p class="title">\s*<a[^>]*>([^<]+)<\/a>/i)?.[1];
      const href = block.match(/<p class="title">\s*<a[^>]*href="([^"]+)"/i)?.[1];
      const tickets = block.match(/href="(https:\/\/www\.quaytickets\.com[^"]+)"/i)?.[1];
      const dateLabel = block.match(/<p class="date">([^<]+)<\/p>/i)?.[1];
      const posterTag = block.match(/<img[^>]*wp-post-image[^>]*>/i)?.[0];
      const posterUrl = posterTag?.match(/src="([^"]+)"/)?.[1];
      if (!rawTitle || !dateLabel) continue;
      const { title, rating } = parsePlazaTitle(rawTitle);
      const film = liveFilmFromTitle(title, {
        rating,
        posterUrl,
      });
      filmsById.set(film.id, film);

      for (const parsed of parseUkEventDateTimes(dateLabel)) {
        if (parsed.date < from || parsed.date > to) continue;
        screenings.push({
          id: `plaza-${parsed.date}-${parsed.startTime}-${film.id}`,
          filmId: film.id,
          cinemaId: CINEMA_ID,
          date: parsed.date,
          startTime: parsed.startTime,
          format: "Standard",
          bookingUrl: tickets || href || "https://stockportplaza.co.uk/whats-on/",
        });
      }
    }

    return { films: [...filmsById.values()], screenings };
  }
}
