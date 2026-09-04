import Link from "next/link";
import { Clapperboard, Clock, MapPin } from "lucide-react";

import { FilmPoster } from "@/components/film/film-poster";
import { Badge } from "@/components/ui/badge";
import { formatRuntime, formatShortDate } from "@/lib/dates";
import type { Film, Screening } from "@/lib/types";

export function FilmCard({
  film,
  nextScreening,
  cinemaCount,
}: {
  film: Film;
  nextScreening?: Screening;
  cinemaCount: number;
}) {
  return (
    <Link href={`/films/${film.id}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-white/8 transition duration-200 group-hover:-translate-y-0.5 group-hover:ring-primary/30">
        <FilmPoster film={film} />
        <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-4">
          <div>
            <h3 className="font-heading text-[0.95rem] leading-snug sm:text-lg">{film.title}</h3>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {formatRuntime(film.runtime)}
              </span>
              <span>{film.rating}</span>
            </p>
          </div>
          <div className="hidden flex-wrap gap-1.5 sm:flex">
            {film.genres.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="outline">
                {genre}
              </Badge>
            ))}
            {film.isRerelease && <Badge>Re-screening</Badge>}
          </div>
          {film.isRerelease && (
            <Badge className="w-fit sm:hidden">Re-screening</Badge>
          )}
          <div className="mt-auto space-y-1 text-xs sm:text-sm">
            {nextScreening ? (
              <p className="text-foreground/90">
                Next: {formatShortDate(nextScreening.date)} · {nextScreening.startTime}
                {nextScreening.format !== "Standard" ? ` · ${nextScreening.format}` : ""}
              </p>
            ) : (
              <p className="text-muted-foreground">No screenings in this range</p>
            )}
            <p className="inline-flex items-center gap-1 text-muted-foreground">
              {cinemaCount > 0 ? (
                <>
                  <MapPin className="size-3.5" />
                  {cinemaCount} {cinemaCount === 1 ? "cinema" : "cinemas"}
                </>
              ) : (
                <>
                  <Clapperboard className="size-3.5" />
                  Not showing nearby
                </>
              )}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
