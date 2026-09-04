"use client";

import Link from "next/link";

import { ShowtimeButton } from "@/components/screening/showtime-button";
import { Button } from "@/components/ui/button";
import { formatLongDate } from "@/lib/dates";
import { groupScreeningsByCinema, groupScreeningsByDate } from "@/lib/grouping";
import { userStore } from "@/lib/store/user-store";
import type { GroupBy, Screening } from "@/lib/types";
import { useUserStore } from "@/components/providers/user-store-provider";

export function ScreeningList({
  screenings,
  filmTitle,
}: {
  screenings: Screening[];
  filmTitle?: string;
}) {
  const { state } = useUserStore();
  const groupBy = state.preferences.groupBy;

  function setGroupBy(next: GroupBy) {
    userStore.setState({
      preferences: { ...state.preferences, groupBy: next },
    });
  }

  if (screenings.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h2 className="font-heading text-xl sm:text-2xl">
          {filmTitle ? "Cinema screenings near Manchester" : "Showtimes"}
        </h2>
        <div className="flex w-full rounded-full bg-muted p-1 sm:w-auto">
          <Button
            size="sm"
            variant={groupBy === "date" ? "default" : "ghost"}
            className="h-9 min-h-9 flex-1 rounded-full sm:flex-none"
            onClick={() => setGroupBy("date")}
          >
            By date
          </Button>
          <Button
            size="sm"
            variant={groupBy === "cinema" ? "default" : "ghost"}
            className="h-9 min-h-9 flex-1 rounded-full sm:flex-none"
            onClick={() => setGroupBy("cinema")}
          >
            By cinema
          </Button>
        </div>
      </div>

      {groupBy === "date" ? (
        <div className="space-y-8">
          {groupScreeningsByDate(screenings).map((group) => (
            <section key={group.date}>
              <h3 className="mb-4 font-heading text-xl">{formatLongDate(group.date)}</h3>
              <div className="space-y-5">
                {group.cinemas.map(({ cinema, screenings: shows }) => (
                  <div key={cinema.id}>
                    <Link
                      href={`/cinemas/${cinema.id}`}
                      className="mb-2 block text-sm font-medium text-primary hover:underline"
                    >
                      {cinema.name}
                    </Link>
                    <div className="flex flex-wrap gap-2">
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
      ) : (
        <div className="space-y-8">
          {groupScreeningsByCinema(screenings).map((group) => (
            <section key={group.cinema.id}>
              <Link href={`/cinemas/${group.cinema.id}`}>
                <h3 className="mb-1 font-heading text-xl hover:text-primary">
                  {group.cinema.name}
                </h3>
              </Link>
              <p className="mb-4 text-sm text-muted-foreground">{group.cinema.area}</p>
              <div className="space-y-4">
                {group.dates.map(({ date, screenings: shows }) => (
                  <div key={date}>
                    <p className="mb-2 text-sm text-muted-foreground">{formatLongDate(date)}</p>
                    <div className="flex flex-wrap gap-2">
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
