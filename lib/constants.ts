export const APP_NAME = "Encore";
export const APP_TAGLINE = "Find when the films you love return to the big screen.";
export const LOCATION_LABEL = "Manchester & Greater Manchester";
export const MANCHESTER_CENTRE = { latitude: 53.4808, longitude: -2.2426 };

export const EXAMPLE_SEARCHES = [
  "Harry Potter",
  "Interstellar",
  "The Dark Knight",
  "Lord of the Rings",
] as const;

export const POPULAR_RESCREENING_SEARCHES = [
  { label: "Harry Potter", href: "/franchises/harry-potter" },
  { label: "Interstellar", href: "/films/interstellar" },
  { label: "Lord of the Rings", href: "/franchises/lord-of-the-rings" },
  { label: "Star Wars", href: "/franchises/star-wars" },
  { label: "The Dark Knight", href: "/films/the-dark-knight" },
  { label: "Studio Ghibli", href: "/franchises/studio-ghibli" },
  { label: "James Bond", href: "/franchises/james-bond" },
] as const;

export const NAV_ITEMS = [
  { href: "/", label: "Discover" },
  { href: "/films", label: "Films" },
  { href: "/cinemas", label: "Cinemas" },
  { href: "/re-screenings", label: "Re-screenings" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/my-cinemas", label: "My Cinemas" },
] as const;

export const RADIUS_OPTIONS = [
  { value: 5, label: "5 miles" },
  { value: 10, label: "10 miles" },
  { value: 25, label: "25 miles" },
  { value: 50, label: "50 miles" },
  { value: "gm", label: "Greater Manchester" },
] as const;

export const FORMAT_OPTIONS = ["Any", "IMAX", "Dolby", "4DX", "Standard"] as const;

export const TIME_PREFERENCE_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "evenings", label: "Evenings" },
  { value: "weekends", label: "Weekends" },
] as const;
