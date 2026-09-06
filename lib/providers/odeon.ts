import type { CinemaProvider, ProviderListings } from "@/lib/providers/types";
import type { ScreeningQuery } from "@/lib/types";

/**
 * ODEON HTML and JSON on odeon.co.uk are behind Cloudflare ("Just a moment…").
 * Showtimes live on Vista OCAPI, but the auth token is only issued inside a
 * real browser session (`window.initialData.api`). A headless browser would
 * unlock Trafford Centre and Great Northern; serverless Node cannot.
 */
export class OdeonProvider implements CinemaProvider {
  id = "odeon";

  async getListings(_query: ScreeningQuery): Promise<ProviderListings> {
    return { films: [], screenings: [] };
  }
}
