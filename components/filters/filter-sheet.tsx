"use client";

import { SlidersHorizontal } from "lucide-react";

import { CinemaSelector } from "@/components/cinema/cinema-selector";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getEnabledCinemas } from "@/lib/data/cinemas";
import { getAllGenres } from "@/lib/data/films";
import { useListings } from "@/components/providers/listings-provider";
import type { CinemaChain, FilmFormat, ScreeningFilters } from "@/lib/types";

const CHAINS: CinemaChain[] = [
  "Vue",
  "ODEON",
  "Cineworld",
  "Everyman",
  "HOME",
  "Showcase",
  "Independent",
];
const FORMATS: FilmFormat[] = ["Standard", "IMAX", "Dolby", "4DX"];

export function FilterSheet({
  filters,
  onChange,
  onReset,
  activeCount,
}: {
  filters: ScreeningFilters;
  onChange: (filters: ScreeningFilters) => void;
  onReset: () => void;
  activeCount: number;
}) {
  const { catalog } = useListings();
  const genres = [...new Set([...getAllGenres(), ...catalog.flatMap((film) => film.genres)])].sort();
  const chainsAvailable = [...new Set(getEnabledCinemas().map((c) => c.chain))];

  function toggleArray<T>(list: T[] | undefined, value: T): T[] {
    const current = list ?? [];
    return current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-11 rounded-full sm:h-8">
          <SlidersHorizontal className="size-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Filter screenings</SheetTitle>
          <SheetDescription>
            Narrow listings by cinema, format, time and whether a title is a re-release.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 px-4 pb-4">
          <section className="space-y-2">
            <Label>Cinema</Label>
            <CinemaSelector
              value={filters.cinemaIds ?? []}
              onChange={(cinemaIds) => onChange({ ...filters, cinemaIds })}
            />
          </section>

          <section className="space-y-2">
            <Label>Cinema chain</Label>
            <div className="flex flex-wrap gap-2">
              {CHAINS.filter((chain) => chainsAvailable.includes(chain)).map((chain) => {
                const active = filters.chains?.includes(chain);
                return (
                  <Button
                    key={chain}
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() =>
                      onChange({ ...filters, chains: toggleArray(filters.chains, chain) })
                    }
                  >
                    {chain}
                  </Button>
                );
              })}
            </div>
          </section>

          <section className="grid gap-2">
            <Label>Distance</Label>
            <Select
              value={filters.maxDistanceMiles ? String(filters.maxDistanceMiles) : "any"}
              onValueChange={(value) =>
                onChange({
                  ...filters,
                  maxDistanceMiles: value === "any" ? undefined : Number(value),
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any distance</SelectItem>
                <SelectItem value="5">Within 5 miles</SelectItem>
                <SelectItem value="10">Within 10 miles</SelectItem>
                <SelectItem value="25">Within 25 miles</SelectItem>
              </SelectContent>
            </Select>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>From</Label>
              <Select
                value={filters.timeFrom ?? "any"}
                onValueChange={(value) =>
                  onChange({ ...filters, timeFrom: value === "any" ? undefined : value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any start</SelectItem>
                  <SelectItem value="12:00">From noon</SelectItem>
                  <SelectItem value="17:00">From 5pm</SelectItem>
                  <SelectItem value="20:00">From 8pm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Until</Label>
              <Select
                value={filters.timeTo ?? "any"}
                onValueChange={(value) =>
                  onChange({ ...filters, timeTo: value === "any" ? undefined : value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any end</SelectItem>
                  <SelectItem value="17:00">Until 5pm</SelectItem>
                  <SelectItem value="20:00">Until 8pm</SelectItem>
                  <SelectItem value="23:59">Until late</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="space-y-2">
            <Label>Film format</Label>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((format) => {
                const active = filters.formats?.includes(format);
                return (
                  <Button
                    key={format}
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() =>
                      onChange({ ...filters, formats: toggleArray(filters.formats, format) })
                    }
                  >
                    {format}
                  </Button>
                );
              })}
            </div>
          </section>

          <section className="space-y-2">
            <Label>Genre</Label>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => {
                const active = filters.genres?.includes(genre);
                return (
                  <Button
                    key={genre}
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() =>
                      onChange({ ...filters, genres: toggleArray(filters.genres, genre) })
                    }
                  >
                    {genre}
                  </Button>
                );
              })}
            </div>
          </section>

          <section className="space-y-2">
            <Label>Release type</Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "All"],
                  ["rerelease", "Re-release only"],
                  ["new", "New release only"],
                ] as const
              ).map(([value, label]) => (
                <Button
                  key={value}
                  size="sm"
                  variant={filters.releaseType === value ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => onChange({ ...filters, releaseType: value })}
                >
                  {label}
                </Button>
              ))}
            </div>
          </section>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={Boolean(filters.trackedOnly)}
              onCheckedChange={(checked) =>
                onChange({ ...filters, trackedOnly: Boolean(checked) })
              }
            />
            Tracked films only
          </label>
        </div>
        <SheetFooter>
          <Button variant="outline" className="rounded-full" onClick={onReset}>
            Clear filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
