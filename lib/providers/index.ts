import type { ProviderListings, CinemaProvider } from "@/lib/providers/types";
import { CineworldProvider } from "@/lib/providers/cineworld";
import { EverymanProvider } from "@/lib/providers/everyman";
import { HomeProvider } from "@/lib/providers/home";
import { LightProvider } from "@/lib/providers/light";
import { NorthernLightProvider } from "@/lib/providers/northern-light";
import { PlazaProvider } from "@/lib/providers/plaza";
import { VueProvider } from "@/lib/providers/vue";
import type { ScreeningQuery } from "@/lib/types";

/**
 * Aggregates chain adapters into one normalized listings payload.
 * Official JSON feeds refresh about every 10 minutes. Scraped sources
 * (Light Stockport, Northern Light Stretford, Stockport Plaza) are cached for a day.
 * ODEON's website is still behind a Cloudflare challenge from Node.
 */
export const cinemaProviders: CinemaProvider[] = [
  new CineworldProvider(),
  new EverymanProvider(),
  new HomeProvider(),
  new VueProvider(),
  new LightProvider(),
  new NorthernLightProvider(),
  new PlazaProvider(),
];

export async function getListingsFromProviders(
  query: ScreeningQuery,
): Promise<{ listings: ProviderListings; sources: { id: string; ok: boolean; screeningCount: number; error?: string }[] }> {
  const settled = await Promise.allSettled(
    cinemaProviders.map(async (provider) => ({
      id: provider.id,
      listings: await provider.getListings(query),
    })),
  );

  const films: ProviderListings["films"] = [];
  const screenings: ProviderListings["screenings"] = [];
  const sources: { id: string; ok: boolean; screeningCount: number; error?: string }[] = [];

  settled.forEach((result, index) => {
    const id = cinemaProviders[index].id;
    if (result.status === "fulfilled") {
      films.push(...result.value.listings.films);
      screenings.push(...result.value.listings.screenings);
      sources.push({
        id,
        ok: true,
        screeningCount: result.value.listings.screenings.length,
      });
    } else {
      sources.push({
        id,
        ok: false,
        screeningCount: 0,
        error: result.reason instanceof Error ? result.reason.message : "Failed to load",
      });
    }
  });

  return { listings: { films, screenings }, sources };
}
