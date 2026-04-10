import { NextResponse } from "next/server";
import { getDailyInspiration } from "@/lib/daily-inspiration";

export async function GET() {
  return NextResponse.json(getDailyInspiration(), {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}