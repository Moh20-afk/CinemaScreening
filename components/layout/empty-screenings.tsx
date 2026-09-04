import { Bell } from "lucide-react";

import { TrackFilmButton } from "@/components/film/track-film-button";
import type { Film } from "@/lib/types";

export function EmptyScreenings({
  film,
  rangeLabel = "the next 30 days",
}: {
  film: Film;
  rangeLabel?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-white/3 px-4 py-8 text-center sm:px-6 sm:py-10">
      <p className="font-heading text-xl sm:text-2xl">No screenings found</p>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        No Manchester screenings for {film.title} in {rangeLabel}.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <TrackFilmButton film={film} emptyState />
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Bell className="size-4 text-primary" />
          Notify me when it returns to cinemas.
        </p>
      </div>
    </div>
  );
}
