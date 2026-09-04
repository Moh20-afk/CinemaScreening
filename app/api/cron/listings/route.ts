import { addDays, startOfDay } from "date-fns";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { loadListings } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily warm-up so scraped listings refresh even when nobody visits.
 * Vercel Cron hits this at 06:00 UTC (`vercel.json`). Set CRON_SECRET
 * in production so only the scheduler (and you) can trigger it.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authorization = request.headers.get("authorization");
    if (authorization !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  revalidateTag("listings-scrape", { expire: 0 });
  revalidateTag("listings-json", { expire: 0 });

  const from = startOfDay(new Date());
  const listings = await loadListings({ from, to: addDays(from, 34) });

  return NextResponse.json({
    ok: true,
    fetchedAt: listings.fetchedAt,
    films: listings.films.length,
    screenings: listings.screenings.length,
    sources: listings.sources,
  });
}
