"use client";

import Link from "next/link";

import { CinemaCard } from "@/components/cinema/cinema-card";
import { getEnabledCinemas } from "@/lib/data/cinemas";
import { distanceMiles, formatDistance } from "@/lib/geo";
import { useGeolocation } from "@/hooks/use-geolocation";
import { Button } from "@/components/ui/button";

export default function CinemasPage() {
  const { coords, status, request } = useGeolocation();
  const cinemas = getEnabledCinemas()
    .map((cinema) => ({
      cinema,
      distance: coords ? distanceMiles(coords, cinema) : undefined,
    }))
    .sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99));

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm tracking-[0.18em] text-primary uppercase">Cinemas</p>
        <h1 className="font-heading text-4xl">Browse by cinema</h1>
        <p className="max-w-2xl text-muted-foreground">
          Greater Manchester venues — multiplexes, Everyman, HOME and independents.
        </p>
        {status !== "granted" && (
          <Button variant="outline" className="rounded-full" onClick={request}>
            Use my location for distances
          </Button>
        )}
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {cinemas.map(({ cinema, distance }) => (
          <div key={cinema.id} className="space-y-2">
            <CinemaCard cinema={cinema} distanceMiles={distance} />
            <Link
              href={`/cinemas/${cinema.id}`}
              className="inline-block text-sm text-primary hover:underline"
            >
              View listings
              {distance !== undefined ? ` · ${formatDistance(distance)}` : ""}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
