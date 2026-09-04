"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSelectedCinemas } from "@/hooks/use-selected-cinemas";
import { getEnabledCinemas } from "@/lib/data/cinemas";
import { cn } from "@/lib/utils";

export function CinemaSelector({
  value,
  onChange,
}: {
  value?: string[];
  onChange?: (ids: string[]) => void;
}) {
  const { selectedCinemaIds } = useSelectedCinemas();
  const selected = value ?? selectedCinemaIds;
  const cinemas = getEnabledCinemas();

  function toggle(id: string) {
    const next = selected.includes(id)
      ? selected.filter((cinemaId) => cinemaId !== id)
      : [...selected, id];
    onChange?.(next);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {cinemas.map((cinema) => {
        const active = selected.includes(cinema.id);
        return (
          <Button
            key={cinema.id}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            className={cn("rounded-full")}
            onClick={() => toggle(cinema.id)}
          >
            {active && <Check className="size-3.5" />}
            {cinema.name.replace("Manchester ", "")}
          </Button>
        );
      })}
    </div>
  );
}
