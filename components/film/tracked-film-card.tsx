import Link from "next/link";
import { Bell } from "lucide-react";

import { FilmPoster } from "@/components/film/film-poster";
import { TrackFilmButton } from "@/components/film/track-film-button";
import { formatLongDate } from "@/lib/dates";
import { getCinemaById } from "@/lib/data/cinemas";
import type { Film, Franchise, Screening } from "@/lib/types";

export function TrackedFilmCard({
  film,
  franchise,
  nextScreening,
  upcomingCount,
}: {
  film?: Film;
  franchise?: Franchise;
  nextScreening?: Screening;
  upcomingCount?: number;
}) {
  const cinema = nextScreening ? getCinemaById(nextScreening.cinemaId) : undefined;
  const title = film?.title ?? franchise?.name ?? "";
  const href = film ? `/films/${film.id}` : `/franchises/${franchise?.id}`;

  return (
    <article className="flex gap-4 rounded-2xl bg-card p-4 ring-1 ring-white/8">
      {film ? (
        <FilmPoster film={film} size="sm" className="w-20 shrink-0" />
      ) : (
        <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Bell className="size-6" />
        </div>
      )}
      <div className="min-w-0 flex-1 space-y-2">
        <Link href={href} className="font-heading text-lg hover:text-primary">
          {title}
        </Link>
        {franchise && <p className="text-xs tracking-wide text-muted-foreground uppercase">Series</p>}
        {nextScreening && cinema ? (
          <p className="text-sm">
            Next screening: {cinema.name}
            <br />
            {formatLongDate(nextScreening.date)} — {nextScreening.startTime}
          </p>
        ) : upcomingCount ? (
          <p className="text-sm">
            {upcomingCount} upcoming {upcomingCount === 1 ? "screening" : "screenings"}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No upcoming screenings currently found.
          </p>
        )}
        <TrackFilmButton film={film} franchise={franchise} />
      </div>
    </article>
  );
}
