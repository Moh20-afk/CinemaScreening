"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";

import { DateSelector } from "@/components/date/date-selector";
import { FilmPoster } from "@/components/film/film-poster";
import { TrackFilmButton } from "@/components/film/track-film-button";
import { WebsiteCinemasNote } from "@/components/cinema/website-listings";
import { EmptyScreenings } from "@/components/layout/empty-screenings";
import { getWebsiteListingsCinemas } from "@/lib/data/cinemas";
import { ListingsStatus } from "@/components/layout/listings-status";
import { ScreeningList } from "@/components/screening/screening-list";
import { Badge } from "@/components/ui/badge";
import { FilterSheet } from "@/components/filters/filter-sheet";
import { getFranchiseById } from "@/lib/data/franchises";
import { formatRuntime } from "@/lib/dates";
import { useFilters } from "@/hooks/use-filters";
import { useScreenings } from "@/hooks/use-screenings";

export default function FilmPage() {
  const { id } = useParams<{ id: string }>();
  const { filters, setFilters, activeCount, reset } = useFilters();
  const { screenings, range, loading, error, getFilm } = useScreenings(filters);
  const film = getFilm(id);

  if (!loading && !film) {
    notFound();
  }

  if (!film) {
    return (
      <div className="space-y-4">
        <ListingsStatus loading={loading} error={error} />
      </div>
    );
  }

  const filmScreenings = screenings.filter((screening) => screening.filmId === film.id);
  const franchise = film.franchiseId ? getFranchiseById(film.franchiseId) : undefined;
  const rangeLabel =
    range.preset === "next30"
      ? "the next 30 days"
      : range.preset === "next7"
        ? "the next 7 days"
        : "these dates";

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="grid gap-6 sm:gap-8 md:grid-cols-[240px_1fr]">
        <FilmPoster film={film} size="lg" className="mx-auto w-44 sm:w-full md:mx-0" />
        <div className="space-y-4">
          <p className="text-sm tracking-[0.18em] text-primary uppercase">
            {film.isRerelease ? "Returning to cinemas" : "Now showing"}
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl">{film.title}</h1>
          <p className="text-muted-foreground">
            {film.releaseYear} · {formatRuntime(film.runtime)} · {film.rating}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {film.genres.map((genre) => (
              <Badge key={genre} variant="outline">
                {genre}
              </Badge>
            ))}
          </div>
          {film.description ? (
            <p className="max-w-2xl leading-relaxed text-foreground/85">{film.description}</p>
          ) : null}
          {franchise && (
            <p className="text-sm">
              Part of{" "}
              <Link href={`/franchises/${franchise.id}`} className="text-primary hover:underline">
                {franchise.name}
              </Link>
            </p>
          )}
          <div className="pt-1 [&>button]:h-11 [&>button]:w-full sm:[&>button]:h-8 sm:[&>button]:w-auto">
            <TrackFilmButton film={film} />
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-3">
        <DateSelector compact />
        <FilterSheet
          filters={filters}
          onChange={setFilters}
          onReset={reset}
          activeCount={activeCount}
        />
        <ListingsStatus loading={loading} error={error} />
      </div>

      {loading ? null : filmScreenings.length === 0 ? (
        <div className="space-y-4">
          <EmptyScreenings film={film} rangeLabel={rangeLabel} />
          <WebsiteCinemasNote cinemas={getWebsiteListingsCinemas()} />
        </div>
      ) : (
        <ScreeningList screenings={filmScreenings} filmTitle={film.title} />
      )}
    </div>
  );
}
