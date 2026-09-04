import type { CinemaProvider, ProviderListings } from "@/lib/providers/types";
import type { ScreeningQuery } from "@/lib/types";

/**
 * Vue HTML has film metadata in Sitecore __NEXT_DATA__, but session times
 * come from a private /showings BFF that 404s or WAF-challenges Node.
 * Stockport Vue is not in Vue's current sitemap.
 */
export class VueProvider implements CinemaProvider {
  id = "vue";

  async getListings(_query: ScreeningQuery): Promise<ProviderListings> {
    return { films: [], screenings: [] };
  }
}
