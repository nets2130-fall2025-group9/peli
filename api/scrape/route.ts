import { NextResponse } from "next/server";
import { scrapeDiningHalls } from "@/lib/scraper";

export async function GET(request: Request) {
  // TODO: verify cron secret when deployed

  try {
    const menuData = await scrapeDiningHalls();

    // TODO: save to DB

    return NextResponse.json({
      success: true,
      diningHalls: Object.keys(menuData).length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to scrape and save menu data" },
      { status: 500 }
    );
  }
}