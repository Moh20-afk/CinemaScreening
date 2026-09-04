import type { CinemaProvider, ProviderListings } from "@/lib/providers/types";
import type { ScreeningQuery } from "@/lib/types";

/**
 * ODEON's website is behind Cloudflare ("Just a moment…") from Node.
 * Server-side HTML scraping cannot reach showtimes without a browser.
 */
export class OdeonProvider implements CinemaProvider {
  id = "odeon";

  async getListings(_query: ScreeningQuery): Promise<ProviderListings> {
    return { films: [], screenings: [] };
  }
}
