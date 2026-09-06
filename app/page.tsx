"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

import { WebsiteCinemasNote } from "@/components/cinema/website-listings";
import { DateSelector } from "@/components/date/date-selector";
import { FilmCard } from "@/components/film/film-card";
import { FilmSearch } from "@/components/film/film-search";
import { Button } from "@/components/ui/button";
import { FilmGridSkeleton, ListingsStatus } from "@/components/layout/listings-status";
import { getCinemaById, listsOnWebsite } from "@/lib/data/cinemas";
import { cinemaCountForFilm, nextScreeningForFilm, uniqueFilmsFromScreenings } from "@/lib/filters";
import { APP_TAGLINE, LOCATION_LABEL, POPULAR_RESCREENING_SEARCHES } from "@/lib/constants";
import { useScreenings } from "@/hooks/use-screenings";
import { useSelectedCinemas } from "@/hooks/use-selected-cinemas";

export default function DiscoverPage() {
  const { screenings, hasPersonalList, showAllCinemas, loading, error, getFilm } = useScreenings();
  const { setShowAllCinemas, selectedCinemaIds, activeCinemaIds } = useSelectedCinemas();
  const listedCinemas = (hasPersonalList && !showAllCinemas ? selectedCinemaIds : activeCinemaIds)
    .map((id) => getCinemaById(id))
    .filter((cinema): cinema is NonNullable<typeof cinema> => Boolean(cinema));
  const websiteCinemas = listedCinemas.filter(listsOnWebsite);
  const liveCinemas = listedCinemas.filter((cinema) => !listsOnWebsite(cinema));
  const onlyWebsiteList = hasPersonalList && !showAllCinemas && liveCinemas.length === 0 && websiteCinemas.length > 0;
  const filmsShowing = uniqueFilmsFromScreenings(screenings, getFilm);
  const returning = filmsShowing.filter(
    (film) => film.isRerelease || film.screeningKind !== "standard",
  );
  const current = filmsShowing.filter(
    (film) => !film.isRerelease && film.screeningKind === "standard",
  );

  return (
    <div className="space-y-10 sm:space-y-16">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-stone-900 via-stone-950 to-black px-4 py-8 sm:px-5 sm:py-12 md:px-12 md:py-16">
        <p className="text-xs tracking-[0.22em] text-primary uppercase sm:text-sm">Manchester cinemas, one list</p>
        <h1 className="font-heading mt-3 max-w-3xl text-3xl leading-tight sm:text-4xl md:text-6xl">
          {APP_TAGLINE}
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Re-releases, anniversary prints and tonight&apos;s times from Vue, Everyman, HOME and
          independents. Cineworld and ODEON open on their own sites.
        </p>
        <div className="mt-8 max-w-2xl">
          <FilmSearch size="hero" showExamples />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1">
            <MapPin className="size-3.5 text-primary" />
            Location: {LOCATION_LABEL}
          </span>
        </div>
        <div className="mt-6">
          <DateSelector />
        </div>
        <div className="mt-4">
          <ListingsStatus loading={loading} error={error} />
        </div>
      </section>

      {hasPersonalList && !showAllCinemas && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm">
            <p>
              {onlyWebsiteList
                ? "Your list is Cineworld and ODEON — times are on their websites."
                : "Showing Encore listings for your cinemas."}
            </p>
            <Button variant="ghost" className="rounded-full" onClick={() => setShowAllCinemas(true)}>
              Show all cinemas
            </Button>
          </div>
          <WebsiteCinemasNote cinemas={websiteCinemas} />
        </div>
      )}
      {hasPersonalList && showAllCinemas && (
        <div className="flex justify-end">
          <Button variant="ghost" className="rounded-full" onClick={() => setShowAllCinemas(false)}>
            Use my cinema list
          </Button>
        </div>
      )}

      <section>
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl">Showing near you</h2>
            <p className="mt-1 text-sm text-muted-foreground">Current films on Greater Manchester screens.</p>
          </div>
          <Link href="/films" className="text-sm text-primary hover:underline">
            All films
          </Link>
        </div>
        {loading ? (
          <FilmGridSkeleton />
        ) : (current.length ? current : filmsShowing).length === 0 ? (
          <p className="text-muted-foreground">
            {onlyWebsiteList
              ? " Use the buttons above to check Cineworld or ODEON, or Show all cinemas for Vue and independents."
              : hasPersonalList && !showAllCinemas
                ? " No live Encore times for these cinemas and dates. Show all cinemas to include Vue, Everyman, HOME and independents."
                : " No live showtimes for these dates. Try another range — Vue often publishes about a week ahead."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {(current.length ? current : filmsShowing).slice(0, 8).map((film) => (
              <FilmCard
                key={film.id}
                film={film}
                nextScreening={nextScreeningForFilm(screenings, film.id)}
                cinemaCount={cinemaCountForFilm(screenings, film.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-6">
            <h2 className="font-heading text-2xl sm:text-3xl">Returning to cinemas</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Re-releases, anniversary screenings, classics, specials, director retrospectives and
            franchise marathons.
          </p>
        </div>
        {loading ? (
          <FilmGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {returning.slice(0, 8).map((film) => (
              <FilmCard
                key={film.id}
                film={film}
                nextScreening={nextScreeningForFilm(screenings, film.id)}
                cinemaCount={cinemaCountForFilm(screenings, film.id)}
              />
            ))}
          </div>
        )}
        <div className="mt-6">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/re-screenings">Browse all re-screenings</Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="font-heading mb-4 text-2xl sm:text-3xl">Popular re-screening searches</h2>
        <div className="flex flex-wrap gap-2">
          {POPULAR_RESCREENING_SEARCHES.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:border-primary/40 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
