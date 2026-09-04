"use client";

import Link from "next/link";

import { TrackedFilmCard } from "@/components/film/tracked-film-card";
import { ListingsStatus } from "@/components/layout/listings-status";
import { getFranchiseById } from "@/lib/data/franchises";
import { nextScreeningForFilm } from "@/lib/filters";
import { useListings } from "@/components/providers/listings-provider";
import { useTrackedItems } from "@/hooks/use-tracked-items";
import { Button } from "@/components/ui/button";

export default function WatchlistPage() {
  const { trackedItems } = useTrackedItems();
  const { listings, loading, error, getFilm } = useListings();
  const screenings = listings.screenings;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm tracking-[0.18em] text-primary uppercase">Watchlist</p>
        <h1 className="font-heading text-4xl">Your cinema watchlist</h1>
        <p className="max-w-2xl text-muted-foreground">
          Films and series you are tracking for a return to Manchester screens. Alerts are not
          sent yet — this list stays on this device.
        </p>
        <ListingsStatus loading={loading} error={error} />
      </header>

      {trackedItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 px-6 py-12 text-center">
          <p className="font-heading text-2xl">Nothing tracked yet</p>
          <p className="mt-2 text-muted-foreground">
            Search an old favourite and tap Track this film.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link href="/re-screenings">Browse re-screenings</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {trackedItems.map((item) => {
            if (item.type === "franchise") {
              const franchise = item.franchiseId
                ? getFranchiseById(item.franchiseId)
                : undefined;
              if (!franchise) return null;
              const upcoming = screenings.filter((screening) =>
                franchise.filmIds.includes(screening.filmId),
              );
              return (
                <TrackedFilmCard
                  key={`franchise-${franchise.id}`}
                  franchise={franchise}
                  upcomingCount={upcoming.length}
                  nextScreening={upcoming[0]}
                />
              );
            }
            const film = item.filmId ? getFilm(item.filmId) : undefined;
            if (!film) return null;
            return (
              <TrackedFilmCard
                key={`film-${film.id}`}
                film={film}
                nextScreening={nextScreeningForFilm(screenings, film.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
