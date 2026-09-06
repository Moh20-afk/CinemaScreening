export type CinemaChain =
  | "Vue"
  | "ODEON"
  | "Cineworld"
  | "Everyman"
  | "HOME"
  | "Showcase"
  | "Independent";

export type FilmFormat = "Standard" | "IMAX" | "Dolby" | "4DX";

export type ScreeningKind =
  | "standard"
  | "rerelease"
  | "anniversary"
  | "classic"
  | "special"
  | "retrospective"
  | "marathon";

export type PreferredTime = "any" | "evenings" | "weekends";

export type RadiusPreference = 5 | 10 | 25 | 50 | "gm";

export type DatePreset =
  | "today"
  | "tomorrow"
  | "weekend"
  | "next7"
  | "next30"
  | "custom";

export type GroupBy = "cinema" | "date";

export type CinemaListingsMode = "live" | "website";

export interface Cinema {
  id: string;
  name: string;
  chain: CinemaChain;
  area: string;
  postcode: string;
  latitude: number;
  longitude: number;
  formats: FilmFormat[];
  websiteUrl: string;
  enabled: boolean;
  inManchester: boolean;
  /** Live = Encore fetches times. Website = open the chain's own listings. */
  listingsMode: CinemaListingsMode;
}

export interface PosterPalette {
  from: string;
  to: string;
  accent: string;
}

export interface Film {
  id: string;
  title: string;
  releaseYear: number;
  runtime: number;
  rating: string;
  genres: string[];
  posterUrl: string;
  description: string;
  franchiseId?: string;
  isRerelease: boolean;
  screeningKind: ScreeningKind;
  posterPalette: PosterPalette;
}

export interface Screening {
  id: string;
  filmId: string;
  cinemaId: string;
  date: string;
  startTime: string;
  format: FilmFormat;
  bookingUrl: string;
}

export interface Franchise {
  id: string;
  name: string;
  filmIds: string[];
  description: string;
}

export interface TrackedItem {
  type: "film" | "franchise";
  filmId?: string;
  franchiseId?: string;
  radius: RadiusPreference;
  preferredFormats: Array<FilmFormat | "Any">;
  preferredTimes: PreferredTime;
}

export interface UserPreferences {
  datePreset: DatePreset;
  customFrom?: string;
  customTo?: string;
  groupBy: GroupBy;
  showAllCinemas: boolean;
}

export interface ScreeningQuery {
  from: Date;
  to: Date;
  cinemaIds?: string[];
}

export interface ListingsSourceStatus {
  id: string;
  ok: boolean;
  screeningCount: number;
  error?: string;
}

export interface ListingsPayload {
  films: Film[];
  screenings: Screening[];
  fetchedAt: string;
  sources: ListingsSourceStatus[];
}

export interface ScreeningFilters {
  cinemaIds?: string[];
  chains?: CinemaChain[];
  maxDistanceMiles?: number;
  timeFrom?: string;
  timeTo?: string;
  formats?: FilmFormat[];
  genres?: string[];
  releaseType?: "all" | "rerelease" | "new";
  trackedOnly?: boolean;
}

export interface DateRange {
  from: Date;
  to: Date;
  preset: DatePreset;
}

/**
 * Future shared-list shape. Not used in the MVP UI, but kept so
 * couple/group lists can sit beside a single-user store later.
 */
export interface SharedList {
  id: string;
  name: string;
  memberIds: string[];
  filmIds: string[];
}

export interface ScreeningTemplate {
  filmId: string;
  cinemaId: string;
  times: string[];
  format: FilmFormat;
  weekdays?: number[];
  dayOffsetStart?: number;
  dayOffsetEnd?: number;
  everyNDays?: number;
}
