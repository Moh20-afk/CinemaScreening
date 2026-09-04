import {
  isRereleaseTitle,
  matchSeedFilm,
  mergeLiveFilm,
  paletteForTitle,
  screeningKindFromSignals,
  slugifyTitle,
} from "@/lib/film-identity";
import type { Film, FilmFormat } from "@/lib/types";

export function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .trim();
}

export function runtimeFromLabel(label: string | undefined): number {
  if (!label) return 0;
  const hours = label.match(/(\d+)\s*h/i);
  const minutes = label.match(/(\d+)\s*m/i);
  const hoursValue = hours ? Number.parseInt(hours[1], 10) : 0;
  const minutesValue = minutes ? Number.parseInt(minutes[1], 10) : 0;
  if (hoursValue || minutesValue) return hoursValue * 60 + minutesValue;
  const asNumber = Number.parseInt(label, 10);
  return Number.isFinite(asNumber) ? asNumber : 0;
}

export function compactDateToIso(value: string): string | null {
  if (!/^\d{8}$/.test(value)) return null;
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

export function displayTimeToHhMm(value: string): string | null {
  const twentyFour = value.trim().match(/^(\d{1,2})[:.](\d{2})$/);
  if (twentyFour) {
    return `${twentyFour[1].padStart(2, "0")}:${twentyFour[2]}`;
  }
  const twelve = value.trim().match(/^(\d{1,2})[:.](\d{2})\s*(am|pm)$/i);
  if (!twelve) return null;
  let hours = Number.parseInt(twelve[1], 10);
  const minutes = twelve[2];
  const meridiem = twelve[3].toLowerCase();
  if (meridiem === "pm" && hours < 12) hours += 12;
  if (meridiem === "am" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

const MONTHS: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

function toIsoDate(year: number, month: number, day: number, now: Date, hasYear: boolean): string | null {
  let candidate = new Date(year, month, day);
  if (!hasYear && candidate.getTime() < now.getTime() - 1000 * 60 * 60 * 24 * 2) {
    candidate = new Date(year + 1, month, day);
  }
  if (Number.isNaN(candidate.getTime())) return null;
  return `${candidate.getFullYear()}-${String(candidate.getMonth() + 1).padStart(2, "0")}-${String(candidate.getDate()).padStart(2, "0")}`;
}

export function parseMonthDayTime(
  value: string,
  now = new Date(),
): { date: string; startTime: string } | null {
  const match = decodeHtmlEntities(value).match(
    /^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{1,2}):(\d{2})\s*(am|pm)$/i,
  );
  if (!match) return null;
  const month = MONTHS[match[1].toLowerCase()];
  if (month === undefined) return null;
  const day = Number.parseInt(match[2], 10);
  const date = toIsoDate(now.getFullYear(), month, day, now, false);
  const startTime = displayTimeToHhMm(`${match[3]}:${match[4]} ${match[5]}`);
  if (!date || !startTime) return null;
  return { date, startTime };
}

export function parseUkEventDateTimes(
  value: string,
  now = new Date(),
): { date: string; startTime: string }[] {
  const decoded = decodeHtmlEntities(value);
  const dateMatches = [
    ...decoded.matchAll(
      /(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)(?:\s+(\d{4}))?\s+at\s+([^]*?)(?=(?:\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+)|$)/gi,
    ),
  ];
  const results: { date: string; startTime: string }[] = [];
  for (const match of dateMatches) {
    const day = Number.parseInt(match[1], 10);
    const month = MONTHS[match[2].toLowerCase()];
    if (month === undefined) continue;
    const hasYear = Boolean(match[3]);
    const year = hasYear ? Number.parseInt(match[3], 10) : now.getFullYear();
    const date = toIsoDate(year, month, day, now, hasYear);
    if (!date) continue;
    const times = [...match[4].matchAll(/(\d{1,2})[.:](\d{2})\s*(am|pm)?/gi)];
    let inherited: string | undefined;
    for (let index = times.length - 1; index >= 0; index -= 1) {
      if (times[index][3]) inherited = times[index][3].toLowerCase();
      else if (inherited) times[index][3] = inherited;
    }
    for (const time of times) {
      const clock = displayTimeToHhMm(`${time[1]}.${time[2]}${time[3] ? ` ${time[3]}` : ""}`);
      if (clock) results.push({ date, startTime: clock });
    }
  }
  return results;
}

export function formatFromBlob(blob: string): FilmFormat {
  const value = blob.toLowerCase();
  if (value.includes("imax")) return "IMAX";
  if (value.includes("4dx")) return "4DX";
  if (value.includes("dolby")) return "Dolby";
  return "Standard";
}

export function liveFilmFromTitle(
  title: string,
  extra?: {
    year?: number;
    runtime?: number;
    rating?: string;
    genres?: string[];
    posterUrl?: string;
    description?: string;
    attributes?: string[];
  },
): Film {
  const clean = decodeHtmlEntities(title);
  const seed = matchSeedFilm(clean, extra?.year);
  const isRerelease =
    seed?.isRerelease || isRereleaseTitle(clean, extra?.attributes ?? [], extra?.year);
  const live: Film = {
    id: seed?.id ?? slugifyTitle(clean),
    title: seed?.title ?? clean,
    releaseYear:
      extra?.year && extra.year > 1880
        ? extra.year
        : (seed?.releaseYear ?? new Date().getFullYear()),
    runtime: extra?.runtime || seed?.runtime || 0,
    rating: extra?.rating || seed?.rating || "TBC",
    genres: extra?.genres?.length ? extra.genres : (seed?.genres ?? []),
    posterUrl: extra?.posterUrl || "",
    description: extra?.description || seed?.description || "",
    franchiseId: seed?.franchiseId,
    isRerelease,
    screeningKind: screeningKindFromSignals({
      title: clean,
      attributes: extra?.attributes,
      isRerelease,
    }),
    posterPalette: seed?.posterPalette ?? paletteForTitle(clean),
  };
  return mergeLiveFilm(live, seed);
}

export function parseEmbeddedJsonObject<T>(source: string): T {
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("No JSON object found");
  }
  return JSON.parse(source.slice(start, end + 1)) as T;
}
