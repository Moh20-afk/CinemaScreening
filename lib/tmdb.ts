export type TmdbPosterSize = "w185" | "w342" | "w500" | "w780";

export const TMDB_IMAGE_HOST = "https://image.tmdb.org/t/p";

/**
 * TMDB image helpers.
 * Seed films have hardcoded poster paths (CDN, no key required).
 * Live titles can be enriched with TMDB_API_KEY via searchTmdbMovie.
 */
export const tmdbByFilmId: Record<string, { tmdbId: number; posterPath: string }> = {
  superman: { tmdbId: 1061474, posterPath: "/ldyfo0BKmz5rWtJJKCvwaNS4cJT.jpg" },
  f1: { tmdbId: 911430, posterPath: "/9PXZIUsSDh4alB80jheWX4fhZmy.jpg" },
  "fantastic-four": { tmdbId: 617126, posterPath: "/nf5qaSEvyYSNeFH0YhSs5EsBLX9.jpg" },
  weapons: { tmdbId: 1078605, posterPath: "/cpf7vsRZ0MYRQcnLWteD5jK9ymT.jpg" },
  "final-reckoning": { tmdbId: 575265, posterPath: "/iKPsC9EFUafRP9SrUznI61getVP.jpg" },
  "after-the-hunt": { tmdbId: 1265063, posterPath: "/ryF8QPGUGlo8gRB4OYKb4J0r3aJ.jpg" },
  interstellar: { tmdbId: 157336, posterPath: "/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg" },
  "the-dark-knight": { tmdbId: 155, posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
  inception: { tmdbId: 27205, posterPath: "/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg" },
  "hp-philosophers-stone": { tmdbId: 671, posterPath: "/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg" },
  "hp-chamber-of-secrets": { tmdbId: 672, posterPath: "/sdEOH0992YZ0QSxgXNIGLq1ToUi.jpg" },
  "hp-prisoner-of-azkaban": { tmdbId: 673, posterPath: "/aWxwnYoe8p2d2fcxOqtvAtJ72Rw.jpg" },
  "hp-goblet-of-fire": { tmdbId: 674, posterPath: "/fECBtHlr0RB3foNHDiCBXeg9Bv9.jpg" },
  "hp-order-of-the-phoenix": { tmdbId: 675, posterPath: "/5aOyriWkPec0zUDxmHFP9qMmBaj.jpg" },
  "hp-half-blood-prince": { tmdbId: 767, posterPath: "/z7uo9zmQdQwU5ZJHFpv2Upl30i1.jpg" },
  "hp-deathly-hallows-1": { tmdbId: 12444, posterPath: "/iGoXIpQb7Pot00EEdwpwPajheZ5.jpg" },
  "hp-deathly-hallows-2": { tmdbId: 12445, posterPath: "/c54HpQmuwXjHq2C9wmoACjxoom3.jpg" },
  "lotr-fellowship": { tmdbId: 120, posterPath: "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg" },
  "lotr-two-towers": { tmdbId: 121, posterPath: "/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg" },
  "lotr-return": { tmdbId: 122, posterPath: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg" },
  "spirited-away": { tmdbId: 129, posterPath: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg" },
  "my-neighbor-totoro": { tmdbId: 8392, posterPath: "/rtGDOeG9LzoerkDGZF9dnVeLppL.jpg" },
  "casino-royale": { tmdbId: 36557, posterPath: "/lMrxYKKhd4lqRzwUHAy5gcx9PSO.jpg" },
  skyfall: { tmdbId: 37724, posterPath: "/d0IVecFQvsGdSbnMAHqiYsNYaJT.jpg" },
  "empire-strikes-back": { tmdbId: 1891, posterPath: "/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg" },
  "a-new-hope": { tmdbId: 11, posterPath: "/fai0rspsNeJCS69wHNjOdWxcI7P.jpg" },
  "return-of-the-jedi": { tmdbId: 1892, posterPath: "/jQYlydvHm3kUix1f8prMucrplhm.jpg" },
  "hunger-games": { tmdbId: 70160, posterPath: "/apa5G43Hha7kH7wJG0gkkHT7FA9.jpg" },
  "catching-fire": { tmdbId: 101299, posterPath: "/vrQHDXjVmbYzadOXQ0UaObunoy2.jpg" },
  "mockingjay-1": { tmdbId: 131631, posterPath: "/4FAA18ZIja70d1Tu5hr5cj2q1sB.jpg" },
  "mockingjay-2": { tmdbId: 131634, posterPath: "/lImKHDfExAulp16grYm8zD5eONE.jpg" },
  twilight: { tmdbId: 8966, posterPath: "/3Gkb6jm6962ADUPaCBqzz9CTbn9.jpg" },
  "new-moon": { tmdbId: 18239, posterPath: "/k2qTooPlHffgNABNWxeJdGMglPK.jpg" },
  parasite: { tmdbId: 496243, posterPath: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg" },
};

export function getPosterUrl(
  filmId: string,
  size: TmdbPosterSize = "w500",
): string | undefined {
  const entry = tmdbByFilmId[filmId];
  if (!entry) return undefined;
  return `${TMDB_IMAGE_HOST}/${size}${entry.posterPath}`;
}

export function tmdbPosterUrl(
  posterPath: string,
  size: TmdbPosterSize = "w500",
): string {
  return `${TMDB_IMAGE_HOST}/${size}${posterPath}`;
}

interface TmdbSearchResult {
  results?: Array<{
    id: number;
    title: string;
    overview?: string;
    poster_path?: string | null;
    release_date?: string;
  }>;
}

export async function searchTmdbMovie(
  title: string,
  year?: number,
): Promise<{ tmdbId: number; posterPath: string; overview: string; year?: number } | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey || !title.trim()) return null;

  const params = new URLSearchParams({
    api_key: apiKey,
    query: title,
    include_adult: "false",
    language: "en-GB",
  });
  if (year && year > 1880) params.set("year", String(year));

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?${params.toString()}`,
      { next: { revalidate: 86_400 } },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as TmdbSearchResult;
    const hit = data.results?.find((item) => item.poster_path) ?? data.results?.[0];
    if (!hit?.poster_path) return null;
    return {
      tmdbId: hit.id,
      posterPath: hit.poster_path,
      overview: hit.overview ?? "",
      year: hit.release_date ? Number.parseInt(hit.release_date.slice(0, 4), 10) : undefined,
    };
  } catch {
    return null;
  }
}
