"use client";

import { useMemo } from "react";

import { getEnabledCinemas, getManchesterCinemas } from "@/lib/data/cinemas";
import { userStore } from "@/lib/store/user-store";
import { useUserStore } from "@/components/providers/user-store-provider";

const ALL_ENABLED_IDS = getEnabledCinemas().map((cinema) => cinema.id);

export function useSelectedCinemas() {
  const { ready, state } = useUserStore();
  const selectedCinemaIds = state.selectedCinemaIds;
  const showAllCinemas = state.preferences.showAllCinemas;
  const hasPersonalList = selectedCinemaIds.length > 0;

  const activeCinemaIds = useMemo(
    () =>
      hasPersonalList && !showAllCinemas ? selectedCinemaIds : ALL_ENABLED_IDS,
    [hasPersonalList, showAllCinemas, selectedCinemaIds],
  );

  function setSelectedCinemaIds(ids: string[]) {
    userStore.setState({ selectedCinemaIds: ids });
  }

  function addCinema(id: string) {
    if (selectedCinemaIds.includes(id)) return;
    setSelectedCinemaIds([...selectedCinemaIds, id]);
  }

  function removeCinema(id: string) {
    setSelectedCinemaIds(selectedCinemaIds.filter((cinemaId) => cinemaId !== id));
  }

  function toggleCinema(id: string) {
    if (selectedCinemaIds.includes(id)) removeCinema(id);
    else addCinema(id);
  }

  function selectAllManchester() {
    setSelectedCinemaIds(getManchesterCinemas().map((cinema) => cinema.id));
  }

  function clearSelection() {
    setSelectedCinemaIds([]);
  }

  function setShowAllCinemas(value: boolean) {
    userStore.setState({
      preferences: { ...state.preferences, showAllCinemas: value },
    });
  }

  return {
    ready,
    selectedCinemaIds,
    activeCinemaIds,
    hasPersonalList,
    showAllCinemas,
    addCinema,
    removeCinema,
    toggleCinema,
    selectAllManchester,
    clearSelection,
    setShowAllCinemas,
  };
}
