"use client";

import type { TrackedItem } from "@/lib/types";
import { trackedItemKey, userStore } from "@/lib/store/user-store";
import { useUserStore } from "@/components/providers/user-store-provider";

export function useTrackedItems() {
  const { ready, state } = useUserStore();
  const trackedItems = state.trackedItems;

  function isTracked(item: Pick<TrackedItem, "type" | "filmId" | "franchiseId">) {
    const key = trackedItemKey(item as TrackedItem);
    return trackedItems.some((tracked) => trackedItemKey(tracked) === key);
  }

  function track(item: TrackedItem) {
    const key = trackedItemKey(item);
    const next = [
      ...trackedItems.filter((tracked) => trackedItemKey(tracked) !== key),
      item,
    ];
    userStore.setState({ trackedItems: next });
  }

  function untrack(item: Pick<TrackedItem, "type" | "filmId" | "franchiseId">) {
    const key = trackedItemKey(item as TrackedItem);
    userStore.setState({
      trackedItems: trackedItems.filter((tracked) => trackedItemKey(tracked) !== key),
    });
  }

  function getFilmTrack(filmId: string) {
    return trackedItems.find((item) => item.type === "film" && item.filmId === filmId);
  }

  function getFranchiseTrack(franchiseId: string) {
    return trackedItems.find(
      (item) => item.type === "franchise" && item.franchiseId === franchiseId,
    );
  }

  return {
    ready,
    trackedItems,
    isTracked,
    track,
    untrack,
    getFilmTrack,
    getFranchiseTrack,
  };
}
