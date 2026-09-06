"use client";

import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSelectedCinemas } from "@/hooks/use-selected-cinemas";
import { listsOnWebsite } from "@/lib/data/cinemas";
import { formatDistance } from "@/lib/geo";
import type { Cinema } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CinemaCard({
  cinema,
  distanceMiles,
  compact = false,
}: {
  cinema: Cinema;
  distanceMiles?: number;
  compact?: boolean;
}) {
  const { selectedCinemaIds, addCinema, removeCinema } = useSelectedCinemas();
  const selected = selectedCinemaIds.includes(cinema.id);

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-white/8",
        compact && "sm:flex-row sm:items-center sm:justify-between",
      )}
    >
      <div className="min-w-0 space-y-1">
        <h3 className="font-heading text-base leading-snug sm:text-lg">{cinema.name}</h3>
        <p className="text-sm text-muted-foreground">
          {cinema.area}
          {distanceMiles !== undefined ? ` · ${formatDistance(distanceMiles)}` : ""}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge variant="secondary">{cinema.chain}</Badge>
          {listsOnWebsite(cinema) ? <Badge variant="outline">Times on their site</Badge> : null}
          {cinema.formats.map((format) => (
            <Badge key={format} variant="outline">
              {format}
            </Badge>
          ))}
        </div>
      </div>
      <Button
        type="button"
        variant={selected ? "outline" : "default"}
        className="h-11 w-full shrink-0 rounded-full sm:h-8 sm:w-auto"
        onClick={() => (selected ? removeCinema(cinema.id) : addCinema(cinema.id))}
      >
        {selected ? (
          "Remove cinema"
        ) : (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-4" />
            Add cinema
          </span>
        )}
      </Button>
    </article>
  );
}
