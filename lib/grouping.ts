import { getCinemaById } from "@/lib/data/cinemas";
import type { Cinema, Screening } from "@/lib/types";

export interface DateCinemaGroup {
  date: string;
  cinemas: { cinema: Cinema; screenings: Screening[] }[];
}

export interface CinemaDateGroup {
  cinema: Cinema;
  dates: { date: string; screenings: Screening[] }[];
}

export function groupScreeningsByDate(screenings: Screening[]): DateCinemaGroup[] {
  const dates = [...new Set(screenings.map((s) => s.date))].sort();
  return dates.map((date) => {
    const day = screenings.filter((s) => s.date === date);
    const cinemaIds = [...new Set(day.map((s) => s.cinemaId))];
    return {
      date,
      cinemas: cinemaIds
        .map((id) => {
          const cinema = getCinemaById(id);
          if (!cinema) return null;
          return {
            cinema,
            screenings: day.filter((s) => s.cinemaId === id),
          };
        })
        .filter((entry): entry is { cinema: Cinema; screenings: Screening[] } => Boolean(entry)),
    };
  });
}

export function groupScreeningsByCinema(screenings: Screening[]): CinemaDateGroup[] {
  const cinemaIds = [...new Set(screenings.map((s) => s.cinemaId))];
  return cinemaIds
    .map((id) => {
      const cinema = getCinemaById(id);
      if (!cinema) return null;
      const atCinema = screenings.filter((s) => s.cinemaId === id);
      const dates = [...new Set(atCinema.map((s) => s.date))].sort();
      return {
        cinema,
        dates: dates.map((date) => ({
          date,
          screenings: atCinema.filter((s) => s.date === date),
        })),
      };
    })
    .filter((entry): entry is CinemaDateGroup => Boolean(entry));
}
