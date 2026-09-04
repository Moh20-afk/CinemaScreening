"use client";

import { useMemo } from "react";

import { resolveDateRange } from "@/lib/dates";
import { userStore } from "@/lib/store/user-store";
import type { DatePreset } from "@/lib/types";
import { useUserStore } from "@/components/providers/user-store-provider";

export function useDateRange() {
  const { ready, state } = useUserStore();
  const preset = state.preferences.datePreset;
  const customFrom = state.preferences.customFrom;
  const customTo = state.preferences.customTo;

  const range = useMemo(
    () => resolveDateRange(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  );

  function setPreset(next: DatePreset) {
    userStore.setState({
      preferences: { ...state.preferences, datePreset: next },
    });
  }

  function setCustomRange(from: string, to: string) {
    userStore.setState({
      preferences: {
        ...state.preferences,
        datePreset: "custom",
        customFrom: from,
        customTo: to,
      },
    });
  }

  return { ready, preset, range, customFrom, customTo, setPreset, setCustomRange };
}
