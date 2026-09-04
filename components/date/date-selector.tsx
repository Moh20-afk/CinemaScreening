"use client";

import { format } from "date-fns";
import type { DateRange as DayPickerRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDateRange } from "@/hooks/use-date-range";
import type { DatePreset } from "@/lib/types";
import { cn } from "@/lib/utils";

const PRESETS: { value: DatePreset; label: string; short: string }[] = [
  { value: "today", label: "Today", short: "Today" },
  { value: "tomorrow", label: "Tomorrow", short: "Tomorrow" },
  { value: "weekend", label: "This weekend", short: "Weekend" },
  { value: "next7", label: "Next 7 days", short: "7 days" },
  { value: "next30", label: "Next 30 days", short: "30 days" },
];

const CINEMA_PRESETS: { value: DatePreset; label: string; short: string }[] = [
  { value: "today", label: "Today", short: "Today" },
  { value: "tomorrow", label: "Tomorrow", short: "Tomorrow" },
  { value: "weekend", label: "Weekend", short: "Weekend" },
  { value: "next7", label: "Week", short: "Week" },
  { value: "next30", label: "Month", short: "Month" },
];

export function DateSelector({
  compact = false,
  cinemaLabels = false,
}: {
  compact?: boolean;
  cinemaLabels?: boolean;
}) {
  const { preset, range, setPreset, setCustomRange } = useDateRange();
  const options = cinemaLabels ? CINEMA_PRESETS : PRESETS;

  function onCustomSelect(next?: DayPickerRange) {
    if (!next?.from) return;
    const from = format(next.from, "yyyy-MM-dd");
    const to = format(next.to ?? next.from, "yyyy-MM-dd");
    setCustomRange(from, to);
  }

  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          size={compact ? "sm" : "default"}
          variant={preset === option.value ? "default" : "outline"}
          className={cn(
            "shrink-0 rounded-full",
            !compact && "h-10 min-h-10 px-3.5 sm:h-9",
            compact && "h-9 min-h-9",
          )}
          onClick={() => setPreset(option.value)}
        >
          <span className="sm:hidden">{option.short}</span>
          <span className="hidden sm:inline">{option.label}</span>
        </Button>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size={compact ? "sm" : "default"}
            variant={preset === "custom" ? "default" : "outline"}
            className={cn(
              "shrink-0 rounded-full",
              !compact && "h-10 min-h-10 px-3.5 sm:h-9",
              compact && "h-9 min-h-9",
            )}
          >
            {preset === "custom"
              ? `${format(range.from, "d MMM")} – ${format(range.to, "d MMM")}`
              : "Custom"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-2" align="start">
          <Calendar
            mode="range"
            selected={{ from: range.from, to: range.to }}
            onSelect={onCustomSelect}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
