"use client";

import { useMemo } from "react";

import { applyScreeningFilters } from "@/lib/filters";
import { toIsoDate } from "@/lib/dates";
import { useDateRange } from "@/hooks/use-date-range";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useListings } from "@/components/providers/listings-provider";
import { useSelectedCinemas } from "@/hooks/use-selected-cinemas";
import { useTrackedItems } from "@/hooks/use-tracked-items";
import type { ScreeningFilters } from "@/lib/types";

const EMPTY_FILTERS: ScreeningFilters = {};

export function useScreenings(extraFilters: ScreeningFilters = EMPTY_FILTERS) {
  const { range } = useDateRange();
  const { activeCinemaIds, hasPersonalList, showAllCinemas } = useSelectedCinemas();
  const { coords } = useGeolocation();
  const { trackedItems } = useTrackedItems();
  const { listings, films, loading, error, getFilm } = useListings();
  const filterKey = JSON.stringify(extraFilters);

  const cinemaIdsForQuery = extraFilters.cinemaIds?.length
    ? extraFilters.cinemaIds
    : activeCinemaIds;

  const cinemaKey = cinemaIdsForQuery.join(",");

  const screenings = useMemo(() => {
    const parsed = JSON.parse(filterKey) as ScreeningFilters;
    const ids = cinemaKey ? cinemaKey.split(",") : undefined;
    const from = toIsoDate(range.from);
    const to = toIsoDate(range.to);
    const scoped = listings.screenings.filter((screening) => {
      if (screening.date < from || screening.date > to) return false;
      if (ids && !ids.includes(screening.cinemaId)) return false;
      return true;
    });
    return applyScreeningFilters(
      scoped,
      { ...parsed, cinemaIds: undefined },
      { userLocation: coords, trackedItems, getFilm },
    );
  }, [listings.screenings, cinemaKey, filterKey, coords, trackedItems, getFilm, range]);

  return {
    screenings,
    films,
    loading,
    error,
    sources: listings.sources,
    range,
    hasPersonalList,
    showAllCinemas,
    getFilm,
  };
}
