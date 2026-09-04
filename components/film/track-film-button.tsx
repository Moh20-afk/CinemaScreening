"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTrackedItems } from "@/hooks/use-tracked-items";
import {
  FORMAT_OPTIONS,
  RADIUS_OPTIONS,
  TIME_PREFERENCE_OPTIONS,
} from "@/lib/constants";
import type {
  Film,
  FilmFormat,
  Franchise,
  PreferredTime,
  RadiusPreference,
  TrackedItem,
} from "@/lib/types";

export function TrackFilmButton({
  film,
  franchise,
  emptyState = false,
}: {
  film?: Film;
  franchise?: Franchise;
  emptyState?: boolean;
}) {
  const { isTracked, track, untrack, getFilmTrack, getFranchiseTrack } = useTrackedItems();
  const type = film ? "film" : "franchise";
  const current = film
    ? getFilmTrack(film.id)
    : franchise
      ? getFranchiseTrack(franchise.id)
      : undefined;
  const tracked = isTracked({ type, filmId: film?.id, franchiseId: franchise?.id });
  const [open, setOpen] = useState(false);
  const [radius, setRadius] = useState<RadiusPreference>(current?.radius ?? "gm");
  const [format, setFormat] = useState<string>(current?.preferredFormats[0] ?? "Any");
  const [times, setTimes] = useState<PreferredTime>(current?.preferredTimes ?? "any");

  const label = film?.title ?? franchise?.name ?? "this";

  function save() {
    const item: TrackedItem = {
      type,
      filmId: film?.id,
      franchiseId: franchise?.id,
      radius,
      preferredFormats: [format as FilmFormat | "Any"],
      preferredTimes: times,
    };
    track(item);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={tracked ? "outline" : "default"} className="rounded-full">
          <Bell className="size-4" />
          {tracked
            ? "Keep tracking"
            : franchise
              ? "Track entire series"
              : emptyState
                ? `Track ${label}`
                : "Track this film"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Track future screenings</DialogTitle>
          <DialogDescription>
            Saved on this device. Notification delivery can be added later without changing this
            preference shape.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Radius</Label>
            <Select
              value={String(radius)}
              onValueChange={(value) =>
                setRadius(value === "gm" ? "gm" : (Number(value) as RadiusPreference))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RADIUS_OPTIONS.map((option) => (
                  <SelectItem key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Formats</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Times</Label>
            <Select
              value={times}
              onValueChange={(value) => setTimes(value as PreferredTime)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_PREFERENCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          {tracked && (
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              onClick={() => {
                untrack({ type, filmId: film?.id, franchiseId: franchise?.id });
                setOpen(false);
              }}
            >
              <BellOff className="size-4" />
              Stop tracking
            </Button>
          )}
          <Button type="button" className="rounded-full" onClick={save}>
            <Bell className="size-4" />
            {tracked ? "Save preferences" : "Keep tracking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
