import { NextRequest, NextResponse } from "next/server";

import { loadListings, parseListingsQuery } from "@/lib/catalog";

export const revalidate = 600;

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from") ?? "";
  const to = request.nextUrl.searchParams.get("to") ?? "";
  const query = parseListingsQuery(from, to);
  if (!query) {
    return NextResponse.json({ error: "from and to must be YYYY-MM-DD" }, { status: 400 });
  }

  try {
    const listings = await loadListings(query);
    return NextResponse.json(listings);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load listings",
      },
      { status: 502 },
    );
  }
}
