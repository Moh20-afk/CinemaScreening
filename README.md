# Encore

Find when the films you love return to the big screen.

Encore is a Manchester and Greater Manchester cinema listings app. It aggregates live showtimes from cinema JSON feeds and daily HTML scrapes into one interface, with a particular focus on re-releases, anniversary screenings, classics and franchise returns.

## Stack

- Next.js (App Router) and TypeScript
- React and Tailwind CSS
- shadcn/ui and Lucide icons
- Fuse.js for fuzzy film search
- date-fns for date ranges
- localStorage for personal cinema lists, watchlist and preferences

No authentication and no Supabase in this version.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## Architecture

```
Cinema JSON / HTML
        ↓
Provider adapter   lib/providers/{cineworld,everyman,home,light,northern-light,plaza}.ts
        ↓
Normalized Film + Screening
        ↓
Catalog / API      lib/catalog.ts, app/api/listings
        ↓
Frontend pages     app/
```

### Live listings

JSON feeds are cached for about 10 minutes. Scraped sites are cached for a day, then warmed by a 06:00 UTC cron at `/api/cron/listings`.

| Source | Feed | Venues | Refresh |
| --- | --- | --- | --- |
| Cineworld | Quickbook `film-events` JSON | Bolton, Didsbury, Ashton-under-Lyne, Warrington | ~10 minutes |
| Vue | Microservice `showings` JSON | Printworks, Lowry | ~10 minutes |
| Everyman | Gatsby box-office JSON (`/api/gatsby-source-boxofficeapi`) | St John's, Altrincham | ~10 minutes |
| HOME | Spektrix public API | HOME Manchester | ~10 minutes |
| The Light | Miniguide `data.ashx` (HTML/JS scrape) | Stockport | Daily |
| Northern Light | Movie-page HTML scrape | Stretford | Daily |
| Stockport Plaza | `/whats-on/type/film/` HTML | Stockport Plaza | Daily |

ODEON's website is behind a Cloudflare browser challenge, so Node cannot read showtimes. Showcase Prestwich is no longer listed on Showcase's UK site. Vue Stockport, Light Salford Quays and The Savoy Heaton Moor are disabled because those venues or sites are gone.

Posters come from the cinema payload where available (Cineworld CDN, Everyman/Webedia, HOME Spektrix, Plaza WordPress). Light titles and other gaps use TMDB when `TMDB_API_KEY` is set.

### Data

| Area | Location |
| --- | --- |
| Cinema seed / config | [`lib/data/cinemas.ts`](lib/data/cinemas.ts) |
| Seed films (watchlist / franchises) | [`lib/data/films.ts`](lib/data/films.ts) |
| Franchises | [`lib/data/franchises.ts`](lib/data/franchises.ts) |
| Provider contract | [`lib/providers/types.ts`](lib/providers/types.ts) |
| Aggregator | [`lib/providers/index.ts`](lib/providers/index.ts) |
| Listings API | [`app/api/listings/route.ts`](app/api/listings/route.ts) |
| Daily refresh | [`app/api/cron/listings/route.ts`](app/api/cron/listings/route.ts), [`vercel.json`](vercel.json) |

To add a cinema, append an object in `lib/data/cinemas.ts`. Set `enabled: false` to hide it from public listings without deleting it.

### Persistence

[`lib/store/user-store.ts`](lib/store/user-store.ts) defines a `UserStore` interface. `LocalStorageUserStore` is the only implementation. UI code goes through React hooks, never `localStorage` directly, so a later `SupabaseUserStore` can replace it after authentication.

Stored today:

- selected cinema IDs
- tracked films and franchises (radius, format, time preferences)
- date preset and grouping preference

### Search

[`lib/search.ts`](lib/search.ts) uses Fuse.js over live titles, seed films and franchise names. Autocomplete lives in [`components/film/film-search.tsx`](components/film/film-search.tsx).

## Environment variables

None are required for listings. Copy [`.env.example`](.env.example) if you want TMDB enrichment or to protect the daily cron:

```bash
TMDB_API_KEY=
CRON_SECRET=
```

## Product surface

- **Discover** — search, date range, showing near you, returning to cinemas
- **Films** — catalogue plus filters
- **Film page** — aggregated showtimes grouped by date or cinema
- **Cinemas / cinema page** — venue listings with date navigation
- **My Cinemas** — add/remove venues, select all Manchester cinemas
- **Re-screenings** — non-standard / re-release titles
- **Watchlist** — tracked films and series
- **Franchise page** — per-title next screening and “track entire series”

## Next development steps

1. Add ODEON listings if a non-Cloudflare feed appears, or via a headless browser service.
2. Add authentication and move the user store to Supabase.
3. Send email or push alerts when a tracked film appears in the listings feed.
4. Shared cinema lists for couples or groups (`SharedList` is already typed).
5. Expand beyond Greater Manchester with a location picker.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
