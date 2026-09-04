"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";

import { FilmPoster } from "@/components/film/film-poster";
import { TrackFilmButton } from "@/components/film/track-film-button";
import { ListingsStatus } from "@/components/layout/listings-status";
import { getFranchiseById } from "@/lib/data/franchises";
import { formatLongDate, formatShortDate } from "@/lib/dates";
import { getCinemaById } from "@/lib/data/cinemas";
import { nextScreeningForFilm } from "@/lib/filters";
import { useListings } from "@/components/providers/listings-provider";

export default function FranchisePage() {
  const { id } = useParams<{ id: string }>();
  const franchise = getFranchiseById(id);
  const { listings, loading, error, getFilm } = useListings();
  if (!franchise) notFound();

  const films = franchise.filmIds
    .map((filmId) => getFilm(filmId))
    .filter((film): film is NonNullable<typeof film> => Boolean(film));
  const screenings = listings.screenings;

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <p className="text-sm tracking-[0.18em] text-primary uppercase">Franchise</p>
        <h1 className="font-heading text-4xl md:text-5xl">{franchise.name}</h1>
        <p className="max-w-2xl text-muted-foreground">{franchise.description}</p>
        <TrackFilmButton franchise={franchise} />
        <ListingsStatus loading={loading} error={error} />
      </header>

      <div className="space-y-4">
        {films.map((film) => {
          const next = nextScreeningForFilm(screenings, film.id);
          const cinema = next ? getCinemaById(next.cinemaId) : undefined;
          return (
            <article
              key={film.id}
              className="flex gap-4 rounded-2xl bg-card p-4 ring-1 ring-white/8"
            >
              <FilmPoster film={film} size="sm" className="w-16 shrink-0 sm:w-20" />
              <div className="min-w-0 flex-1">
                <Link href={`/films/${film.id}`} className="font-heading text-lg hover:text-primary">
                  {film.title}
                </Link>
                <p className="text-sm text-muted-foreground">{film.releaseYear}</p>
                {next && cinema ? (
                  <p className="mt-2 text-sm">
                    Next screening: {formatLongDate(next.date)} · {cinema.name} · {next.startTime}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No screenings currently found
                  </p>
                )}
              </div>
              {next && (
                <p className="hidden text-sm text-primary sm:block">{formatShortDate(next.date)}</p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
