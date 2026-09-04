import type { CinemaProvider, ProviderListings } from "@/lib/providers/types";
import type { ScreeningQuery } from "@/lib/types";

/**
 * Showcase Prestwich is no longer on Showcase's UK theater list.
 * The Savoy Heaton Moor domain does not resolve.
 * Light Stockport and Stockport Plaza are scraped by dedicated providers.
 */
export class IndependentProvider implements CinemaProvider {
  id = "independent";

  async getListings(_query: ScreeningQuery): Promise<ProviderListings> {
    return { films: [], screenings: [] };
  }
}
