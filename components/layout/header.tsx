"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { FilmSearch } from "@/components/film/film-search";
import { APP_NAME } from "@/lib/constants";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-3 sm:h-16 sm:gap-4 sm:px-4 md:h-[4.25rem] md:px-6">
        <Link href="/" className="shrink-0">
          <span className="font-heading text-lg tracking-tight text-primary sm:text-xl md:text-2xl">
            {APP_NAME}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={cn("ml-auto min-w-0 flex-1", isHome && "hidden")}>
          {!isHome && <FilmSearch size="compact" />}
        </div>
      </div>
    </header>
  );
}
