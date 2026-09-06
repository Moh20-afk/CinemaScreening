"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";

import { WebsiteListingsPanel } from "@/components/cinema/website-listings";
import { DateSelector } from "@/components/date/date-selector";
import { ListingsStatus } from "@/components/layout/listings-status";
import { ShowtimeButton } from "@/components/screening/showtime-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCinemaById, listsOnWebsite } from "@/lib/data/cinemas";
import { formatLongDate } from "@/lib/dates";
import { useScreenings } from "@/hooks/use-screenings";
import { useSelectedCinemas } from "@/hooks/use-selected-cinemas";
import type { Film, Screening } from "@/lib/types";

function groupByFilm(
  screenings: Screening[],
  getFilm: (id: string) => Film | undefined,
) {
  const dates = [...new Set(screenings.map((s) => s.date))].sort();
  return dates.map((date) => {
    const day = screenings.filter((s) => s.date === date);
    const filmIds = [...new Set(day.map((s) => s.filmId))];
    return {
      date,
      films: filmIds
        .map((filmId) => {
          const film = getFilm(filmId);
          if (!film) return null;
          return { film, screenings: day.filter((s) => s.filmId === filmId) };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    };
  });
}

export default function CinemaListingsPage() {
  const { id } = useParams<{ id: string }>();
  const cinema = getCinemaById(id);
  const { selectedCinemaIds, addCinema, removeCinema } = useSelectedCinemas();
  const { screenings, loading, error, getFilm } = useScreenings({
    cinemaIds: cinema ? [cinema.id] : ["__none__"],
  });

  if (!cinema || !cinema.enabled) {
    notFound();
  }

  const selected = selectedCinemaIds.includes(cinema.id);
  const websiteOnly = listsOnWebsite(cinema);
  const groups = groupByFilm(screenings, getFilm);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm tracking-[0.18em] text-primary uppercase">{cinema.chain}</p>
        <h1 className="font-heading text-4xl">{cinema.name}</h1>
        <p className="text-muted-foreground">
          {cinema.area} · {cinema.postcode}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {cinema.formats.map((format) => (
            <Badge key={format} variant="outline">
              {format}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="rounded-full"
            variant={selected ? "outline" : "default"}
            onClick={() => (selected ? removeCinema(cinema.id) : addCinema(cinema.id))}
          >
            {selected ? "Remove cinema" : "Add cinema"}
          </Button>
          {websiteOnly ? null : (
            <Button asChild variant="ghost" className="rounded-full">
              <a href={cinema.websiteUrl} target="_blank" rel="noreferrer">
                Cinema website
              </a>
            </Button>
          )}
        </div>
      </header>

      {websiteOnly ? (
        <WebsiteListingsPanel cinema={cinema} />
      ) : (
        <>
          <DateSelector cinemaLabels />
          <ListingsStatus loading={loading} error={error} chain={cinema.chain} />
        </>
      )}

      {websiteOnly ? null : loading ? null : groups.length === 0 ? (
        <p className="text-muted-foreground">
          No live listings for these dates. Try another range — Vue and the independents
          usually publish a week or more ahead.
        </p>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.date}>
              <h2 className="font-heading mb-4 text-2xl">{formatLongDate(group.date)}</h2>
              <div className="space-y-6">
                {group.films.map(({ film, screenings: shows }) => (
                  <div key={film.id}>
                    <Link href={`/films/${film.id}`} className="font-heading text-xl hover:text-primary">
                      {film.title}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {shows.map((show) => (
                        <ShowtimeButton
                          key={show.id}
                          time={show.startTime}
                          format={show.format}
                          href={show.bookingUrl}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
