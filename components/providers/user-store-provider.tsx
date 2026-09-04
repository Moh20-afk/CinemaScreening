"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  defaultUserState,
  userStore,
  type UserState,
} from "@/lib/store/user-store";

const UserStoreContext = createContext<{ ready: boolean; state: UserState }>({
  ready: false,
  state: defaultUserState,
});

function subscribe(listener: () => void) {
  return userStore.subscribe(listener);
}

function getSnapshot() {
  userStore.hydrate();
  return userStore.getState();
}

function getServerSnapshot() {
  return defaultUserState;
}

function clientSubscribe() {
  return () => undefined;
}

export function UserStoreProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(clientSubscribe, () => true, () => false);
  const value = useMemo(() => ({ ready, state }), [ready, state]);

  return <UserStoreContext.Provider value={value}>{children}</UserStoreContext.Provider>;
}

export function useUserStore() {
  return useContext(UserStoreContext);
}
