"use client";

import { DateSelector } from "@/components/date/date-selector";
import { FilmCard } from "@/components/film/film-card";
import { FilterSheet } from "@/components/filters/filter-sheet";
import { FilmGridSkeleton, ListingsStatus } from "@/components/layout/listings-status";
import { cinemaCountForFilm, nextScreeningForFilm, uniqueFilmsFromScreenings } from "@/lib/filters";
import { useListings } from "@/components/providers/listings-provider";
import { useFilters } from "@/hooks/use-filters";
import { useScreenings } from "@/hooks/use-screenings";

export default function ReScreeningsPage() {
  const { filters, setFilters, activeCount, reset } = useFilters({
    releaseType: "rerelease",
  });
  const { screenings, loading, error, getFilm } = useScreenings(filters);
  const { catalog } = useListings();
  const showing = uniqueFilmsFromScreenings(screenings, getFilm).filter(
    (film) => film.isRerelease || film.screeningKind !== "standard",
  );
  const idle = catalog.filter(
    (film) =>
      (film.isRerelease || film.screeningKind !== "standard") &&
      !showing.some((item) => item.id === film.id),
  );

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm tracking-[0.18em] text-primary uppercase">Re-screenings</p>
        <h1 className="font-heading text-3xl sm:text-4xl">Returning to cinemas</h1>
        <p className="max-w-2xl text-muted-foreground">
          Anniversary prints, classics, specials, Ghibli, franchise nights and director
          retrospectives — the reason Encore exists.
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
      {loading ? (
        <FilmGridSkeleton />
      ) : showing.length === 0 ? (
        <p className="text-muted-foreground">
          No re-screenings in this date range. Track a title and we will keep it on your watchlist.
        </p>
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
      {idle.length > 0 && (
        <section>
          <h2 className="font-heading mb-4 text-2xl">Worth tracking</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {idle.map((film) => (
              <FilmCard key={film.id} film={film} cinemaCount={0} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
