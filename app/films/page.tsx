"use client";

import { DateSelector } from "@/components/date/date-selector";
import { FilmCard } from "@/components/film/film-card";
import { FilterSheet } from "@/components/filters/filter-sheet";
import { FilmGridSkeleton, ListingsStatus } from "@/components/layout/listings-status";
import { cinemaCountForFilm, nextScreeningForFilm, uniqueFilmsFromScreenings } from "@/lib/filters";
import { useListings } from "@/components/providers/listings-provider";
import { useFilters } from "@/hooks/use-filters";
import { useScreenings } from "@/hooks/use-screenings";

export default function FilmsPage() {
  const { filters, setFilters, activeCount, reset } = useFilters();
  const { screenings, loading, error, getFilm } = useScreenings(filters);
  const { catalog } = useListings();
  const showing = uniqueFilmsFromScreenings(screenings, getFilm);
  const others = catalog.filter((film) => !showing.some((item) => item.id === film.id));

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm tracking-[0.18em] text-primary uppercase">Films</p>
        <h1 className="font-heading text-3xl sm:text-4xl">What&apos;s on</h1>
        <p className="max-w-2xl text-muted-foreground">
          Browse every title in the current listings, including older films coming back for a
          limited run.
        </p>
        <ListingsStatus loading={loading} error={error} />
      </header>
      <div className="space-y-3">
        <DateSelector compact />
        <FilterSheet
          filters={filters}
          onChange={setFilters}
          onReset={reset}
          activeCount={activeCount}
        />
      </div>
      <section>
        <h2 className="font-heading mb-4 text-2xl">Showing in your dates</h2>
        {loading ? (
          <FilmGridSkeleton />
        ) : showing.length === 0 ? (
          <p className="text-muted-foreground">No films match these filters.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {showing.map((film) => (
              <FilmCard
                key={film.id}
                film={film}
                nextScreening={nextScreeningForFilm(screenings, film.id)}
                cinemaCount={cinemaCountForFilm(screenings, film.id)}
              />
            ))}
          </div>
        )}
      </section>
      {others.length > 0 && (
        <section>
          <h2 className="font-heading mb-4 text-2xl">Not showing right now</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Track these for when they return.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {others.map((film) => (
              <FilmCard key={film.id} film={film} cinemaCount={0} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
