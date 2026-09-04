"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { addDays, startOfDay } from "date-fns";

import { emptyListings, resolveFilm } from "@/lib/catalog";
import { toIsoDate } from "@/lib/dates";
import { films as seedFilms } from "@/lib/data/films";
import type { Film, ListingsPayload } from "@/lib/types";

interface ListingsContextValue {
  listings: ListingsPayload;
  films: Film[];
  catalog: Film[];
  loading: boolean;
  error: string | null;
  getFilm: (id: string) => Film | undefined;
}

const ListingsContext = createContext<ListingsContextValue>({
  listings: emptyListings(),
  films: [],
  catalog: seedFilms,
  loading: true,
  error: null,
  getFilm: (id) => seedFilms.find((film) => film.id === id),
});

const LISTINGS_FROM = toIsoDate(startOfDay(new Date()));
const LISTINGS_TO = toIsoDate(addDays(startOfDay(new Date()), 34));

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<ListingsPayload>(emptyListings());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/listings?from=${LISTINGS_FROM}&to=${LISTINGS_TO}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load listings (${response.status})`);
        }
        return response.json() as Promise<ListingsPayload>;
      })
      .then((payload) => {
        if (cancelled) return;
        setListings(payload);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load listings");
        setListings(emptyListings());
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<ListingsContextValue>(() => {
    const live = listings.films;
    const catalogMap = new Map<string, Film>();
    for (const film of seedFilms) catalogMap.set(film.id, film);
    for (const film of live) catalogMap.set(film.id, film);
    const catalog = [...catalogMap.values()];
    return {
      listings,
      films: live,
      catalog,
      loading,
      error,
      getFilm: (id: string) => resolveFilm(id, live),
    };
  }, [listings, loading, error]);

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}

export function useListings() {
  return useContext(ListingsContext);
}
