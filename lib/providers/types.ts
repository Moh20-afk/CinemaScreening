import type { Film, Screening, ScreeningQuery } from "@/lib/types";

/**
 * Cinema data adapter contract.
 *
 * Cinema website/API
 *   → provider adapter (this interface)
 *   → normalized Film + Screening
 *   → catalog
 *   → frontend
 *
 * JSON adapters (Everyman, HOME, Vue) refresh about every 10 minutes.
 * HTML scrapers (Light Stockport, Northern Light Stretford, Stockport Plaza) refresh about once a day.
 */
export interface ProviderListings {
  films: Film[];
  screenings: Screening[];
}

export interface ProviderSourceStatus {
  id: string;
  ok: boolean;
  screeningCount: number;
  error?: string;
}

export interface CinemaProvider {
  id: string;
  getListings(query: ScreeningQuery): Promise<ProviderListings>;
}
