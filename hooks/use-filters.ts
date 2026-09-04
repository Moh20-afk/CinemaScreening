"use client";

import { useMemo, useState } from "react";

import type { ScreeningFilters } from "@/lib/types";

const emptyFilters: ScreeningFilters = {
  releaseType: "all",
};

export function useFilters(initial?: ScreeningFilters) {
  const [filters, setFilters] = useState<ScreeningFilters>(initial ?? emptyFilters);

  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.cinemaIds?.length) count += 1;
    if (filters.chains?.length) count += 1;
    if (filters.maxDistanceMiles) count += 1;
    if (filters.timeFrom || filters.timeTo) count += 1;
    if (filters.formats?.length) count += 1;
    if (filters.genres?.length) count += 1;
    if (filters.releaseType && filters.releaseType !== "all") count += 1;
    if (filters.trackedOnly) count += 1;
    return count;
  }, [filters]);

  function reset() {
    setFilters(emptyFilters);
  }

  return { filters, setFilters, activeCount, reset };
}
