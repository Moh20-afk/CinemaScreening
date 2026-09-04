"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { FilmCard } from "@/components/film/film-card";
import { FilmSearch } from "@/components/film/film-search";
import { cinemaCountForFilm, nextScreeningForFilm } from "@/lib/filters";
import { searchCatalog } from "@/lib/search";
import { useListings } from "@/components/providers/listings-provider";
import { useScreenings } from "@/hooks/use-screenings";
import Link from "next/link";

function SearchResults() {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const { catalog } = useListings();
  const hits = searchCatalog(query, catalog, 20);
  const { screenings } = useScreenings();
  const films = hits.filter((hit) => hit.type === "film").map((hit) => hit.item);
  const franchises = hits.filter((hit) => hit.type === "franchise").map((hit) => hit.item);

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h1 className="font-heading text-4xl">Search</h1>
        <FilmSearch size="hero" initialQuery={query} />
      </header>

      {query.trim().length < 2 ? (
        <p className="text-muted-foreground">Type at least two letters to search.</p>
      ) : hits.length === 0 ? (
        <p className="text-muted-foreground">No films match “{query}”.</p>
      ) : (
        <>
          {franchises.length > 0 && (
            <section>
              <h2 className="font-heading mb-3 text-2xl">Series</h2>
              <div className="flex flex-wrap gap-2">
                {franchises.map((franchise) => (
                  <Link
                    key={franchise.id}
                    href={`/franchises/${franchise.id}`}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:border-primary/40"
                  >
                    {franchise.name}
                  </Link>
                ))}
              </div>
            </section>
          )}
          <section>
            <h2 className="font-heading mb-4 text-2xl">Films</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {films.map((film) => (
                <FilmCard
                  key={film.id}
                  film={film}
                  nextScreening={nextScreeningForFilm(screenings, film.id)}
                  cinemaCount={cinemaCountForFilm(screenings, film.id)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Searching…</p>}>
      <SearchResults />
    </Suspense>
  );
}
