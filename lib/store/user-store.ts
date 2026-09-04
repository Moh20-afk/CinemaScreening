import type { TrackedItem, UserPreferences } from "@/lib/types";

const STORAGE_KEY = "encore-user-v1";

export const defaultPreferences: UserPreferences = {
  datePreset: "next7",
  groupBy: "date",
  showAllCinemas: false,
};

export interface UserState {
  selectedCinemaIds: string[];
  trackedItems: TrackedItem[];
  preferences: UserPreferences;
}

export const defaultUserState: UserState = {
  selectedCinemaIds: [],
  trackedItems: [],
  preferences: defaultPreferences,
};

/**
 * Persistence contract. LocalStorage is the MVP implementation.
 * A later SupabaseUserStore can implement the same methods after auth.
 */
export interface UserStore {
  getState(): UserState;
  setState(partial: Partial<UserState>): void;
  subscribe(listener: () => void): () => void;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readStorage(): UserState {
  if (!isBrowser()) return defaultUserState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultUserState;
    const parsed = JSON.parse(raw) as Partial<UserState>;
    return {
      selectedCinemaIds: parsed.selectedCinemaIds ?? [],
      trackedItems: parsed.trackedItems ?? [],
      preferences: { ...defaultPreferences, ...parsed.preferences },
    };
  } catch {
    return defaultUserState;
  }
}

function writeStorage(state: UserState) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

class LocalStorageUserStore implements UserStore {
  private state: UserState = defaultUserState;
  private listeners = new Set<() => void>();
  private hydrated = false;

  hydrate() {
    if (this.hydrated) return;
    this.state = readStorage();
    this.hydrated = true;
  }

  getState() {
    return this.state;
  }

  setState(partial: Partial<UserState>) {
    this.state = { ...this.state, ...partial };
    writeStorage(this.state);
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const userStore = new LocalStorageUserStore();

export function trackedItemKey(item: TrackedItem): string {
  return item.type === "film"
    ? `film:${item.filmId}`
    : `franchise:${item.franchiseId}`;
}
