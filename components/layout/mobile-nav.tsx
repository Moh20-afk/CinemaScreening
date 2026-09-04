"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Building2,
  Compass,
  Film,
  MapPin,
  RotateCcw,
} from "lucide-react";

import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS = {
  "/": Compass,
  "/films": Film,
  "/cinemas": Building2,
  "/re-screenings": RotateCcw,
  "/watchlist": Bookmark,
  "/my-cinemas": MapPin,
} as const;

const SHORT_LABELS: Record<(typeof NAV_ITEMS)[number]["href"], string> = {
  "/": "Discover",
  "/films": "Films",
  "/cinemas": "Cinemas",
  "/re-screenings": "Returns",
  "/watchlist": "Watchlist",
  "/my-cinemas": "Mine",
};

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <ul className="grid grid-cols-6">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.href];
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-label={item.label}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 px-0.5 py-2 text-[10px] leading-tight",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                <span className="max-w-full truncate">{SHORT_LABELS[item.href]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
