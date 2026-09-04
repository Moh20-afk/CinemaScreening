"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { EXAMPLE_SEARCHES } from "@/lib/constants";
import { bestSearchDestination, searchCatalog } from "@/lib/search";
import { getPosterUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { useListings } from "@/components/providers/listings-provider";

export function FilmSearch({
  size = "compact",
  initialQuery = "",
  showExamples = false,
}: {
  size?: "hero" | "compact";
  initialQuery?: string;
  showExamples?: boolean;
}) {
  const router = useRouter();
  const { catalog } = useListings();
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const hits = useMemo(() => searchCatalog(query, catalog, 8), [query, catalog]);

  function submit(value = query) {
    const trimmed = value.trim();
    if (!trimmed) return;
    const dest =
      bestSearchDestination(trimmed, catalog) ?? `/search?q=${encodeURIComponent(trimmed)}`;
    router.push(dest);
    setOpen(false);
  }

  return (
    <div className="w-full">
      <div className="relative">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="relative">
          <Search
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-1/2 z-10 -translate-y-1/2",
              size === "hero"
                ? "left-4 size-5 text-primary"
                : "left-3.5 size-4 text-muted-foreground",
            )}
          />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => query.length >= 2 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Search for a film..."
            className={cn(
              "w-full rounded-full border border-white/10 bg-white/5 text-foreground shadow-inner outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-3 focus:ring-primary/20",
              size === "hero"
                ? "h-12 pl-12 pr-4 text-base md:h-16 md:text-lg"
                : "h-11 pl-10 pr-3 text-base md:h-10 md:text-sm",
            )}
          />
        </div>
      </form>

      {open && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-popover shadow-2xl">
          <Command shouldFilter={false}>
            <CommandList>
              <CommandEmpty>No films or series match that search.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                {hits.map((hit) =>
                  hit.type === "franchise" ? (
                    <CommandItem
                      key={`franchise-${hit.item.id}`}
                      value={hit.item.name}
                      onMouseDown={(event) => event.preventDefault()}
                      onSelect={() => router.push(`/franchises/${hit.item.id}`)}
                    >
                      <span className="font-medium">{hit.item.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">Series</span>
                    </CommandItem>
                  ) : (
                    <CommandItem
                      key={`film-${hit.item.id}`}
                      value={hit.item.title}
                      onMouseDown={(event) => event.preventDefault()}
                      onSelect={() => router.push(`/films/${hit.item.id}`)}
                    >
                      {(hit.item.posterUrl || getPosterUrl(hit.item.id, "w185")) && (
                        <Image
                          src={hit.item.posterUrl || getPosterUrl(hit.item.id, "w185")!}
                          alt=""
                          width={28}
                          height={42}
                          className="size-7 rounded-sm object-cover"
                        />
                      )}
                      <span className="min-w-0 truncate font-medium">{hit.item.title}</span>
                      <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                        {hit.item.releaseYear}
                      </span>
                    </CommandItem>
                  ),
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
      </div>

      {showExamples && (
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLE_SEARCHES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => submit(example)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
