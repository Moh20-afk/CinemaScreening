"use client";

import Link from "next/link";

import { CinemaCard } from "@/components/cinema/cinema-card";
import { getEnabledCinemas, listsOnWebsite } from "@/lib/data/cinemas";
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
          Live times for Vue, Everyman, HOME and independents. Cineworld and ODEON open on
          their own websites.
        </p>
        {status !== "granted" && (
          <Button variant="outline" className="rounded-full" onClick={request}>
            Use my location for distances
          </Button>
        )}
      </header>
      <section className="space-y-4">
        <h2 className="font-heading text-2xl">Live in Encore</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {cinemas
            .filter(({ cinema }) => !listsOnWebsite(cinema))
            .map(({ cinema, distance }) => (
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
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl">Times on their website</h2>
        <p className="text-sm text-muted-foreground">
          Book Cineworld and ODEON on their own sites — Encore cannot show those times.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {cinemas
            .filter(({ cinema }) => listsOnWebsite(cinema))
            .map(({ cinema, distance }) => (
              <div key={cinema.id} className="space-y-2">
                <CinemaCard cinema={cinema} distanceMiles={distance} />
                <a
                  href={cinema.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-sm text-primary hover:underline"
                >
                  Check times on {cinema.chain}
                  {distance !== undefined ? ` · ${formatDistance(distance)}` : ""}
                </a>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
