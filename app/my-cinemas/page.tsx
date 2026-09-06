"use client";

import { CinemaCard } from "@/components/cinema/cinema-card";
import { Button } from "@/components/ui/button";
import { getEnabledCinemas } from "@/lib/data/cinemas";
import { distanceMiles } from "@/lib/geo";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useSelectedCinemas } from "@/hooks/use-selected-cinemas";

export default function MyCinemasPage() {
  const { selectedCinemaIds, selectAllManchester, clearSelection } = useSelectedCinemas();
  const { coords, status, request } = useGeolocation();
  const all = getEnabledCinemas()
    .map((cinema) => ({
      cinema,
      distance: coords ? distanceMiles(coords, cinema) : undefined,
    }))
    .sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99));

  const mine = all.filter(({ cinema }) => selectedCinemaIds.includes(cinema.id));
  const others = all.filter(({ cinema }) => !selectedCinemaIds.includes(cinema.id));

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm tracking-[0.18em] text-primary uppercase">My Cinemas</p>
        <h1 className="font-heading text-3xl sm:text-4xl">Your cinema list</h1>
        <p className="max-w-2xl text-muted-foreground">
          Add the venues you actually go to. Encore listings follow this set. Cineworld and
          ODEON stay on the list as shortcuts to their own sites.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button className="h-11 rounded-full sm:h-8" onClick={selectAllManchester}>
            Select all Manchester cinemas
          </Button>
          <Button variant="outline" className="h-11 rounded-full sm:h-8" onClick={clearSelection}>
            Clear selection
          </Button>
          {status !== "granted" && (
            <Button variant="ghost" className="h-11 rounded-full sm:h-8" onClick={request}>
              Use my location
            </Button>
          )}
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl">My Cinemas</h2>
        {mine.length === 0 ? (
          <p className="text-muted-foreground">
            You have not added any cinemas yet. Start with the Manchester set, or pick venues below.
          </p>
        ) : (
          <div className="grid gap-3">
            {mine.map(({ cinema, distance }) => (
              <CinemaCard key={cinema.id} cinema={cinema} distanceMiles={distance} compact />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl">Other cinemas</h2>
        <div className="grid gap-3">
          {others.map(({ cinema, distance }) => (
            <CinemaCard key={cinema.id} cinema={cinema} distanceMiles={distance} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
