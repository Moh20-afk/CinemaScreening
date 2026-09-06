export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-3 pb-28 pt-8 text-center text-[11px] leading-relaxed text-muted-foreground sm:px-4 md:px-6 lg:pb-10">
      <p>
        Live showtimes from Cineworld, Vue, Everyman, HOME Manchester, The Light Stockport,
        Northern Light Stretford and Stockport Plaza. ODEON still blocks server-side listings.
      </p>
      <p className="mt-2">
        This product uses the TMDB API but is not endorsed or certified by TMDB.
        Poster images courtesy of cinema partners and{" "}
        <a
          href="https://www.themoviedb.org/"
          className="text-primary/80 underline-offset-2 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          The Movie Database
        </a>
        .
      </p>
    </footer>
  );
}
