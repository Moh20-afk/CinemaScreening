import { NextResponse } from "next/server";

import { loadVueListings } from "@/lib/providers/vue";

export const runtime = "edge";
export const preferredRegion = ["lhr1"];

/**
 * Fetch Vue showtimes from the Edge network (Cloudflare). Vercel Node IPs
 * often get a 403 on myvue.com; this hop exists so production can still
 * collect the session cookie.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? "";
  const to = url.searchParams.get("to") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return NextResponse.json({ error: "from and to must be YYYY-MM-DD" }, { status: 400 });
  }

  try {
    const listings = await loadVueListings({
      from: new Date(`${from}T12:00:00Z`),
      to: new Date(`${to}T12:00:00Z`),
    });
    return NextResponse.json(listings);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load Vue listings",
      },
      { status: 502 },
    );
  }
}
