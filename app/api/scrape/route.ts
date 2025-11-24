import { NextResponse } from "next/server";
import { scrapeDiningHalls } from "@/lib/scraper";
import { DiningHall, DiningHallData, MenuItem, MealSchedule } from "@/lib/types";
import { convertToTimestamptz } from "@/lib/utils";
import { createMenuItems, createMealSchedule } from "@/supabase/db";

export async function GET(request: Request) {
  // TODO: verify cron secret when deployed

  try {
    const menuData: DiningHallData = await scrapeDiningHalls();
    const now = new Date().toISOString();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    // group items by name and dining hall to create meal_types array
    const itemsMap = new Map<string, MenuItem>();
    const mealSchedules: MealSchedule[] = [];

    for (const [diningHallName, mealData] of Object.entries(menuData)) {
      (["breakfast", "lunch", "dinner", "brunch"] as const).forEach(
        (mealType) => {
          const mealInfo = mealData[mealType];

          // create meal schedule entry if meal has items and time info
          if (
            mealInfo.menu.length > 0 &&
            mealInfo.start_time &&
            mealInfo.end_time
          ) {
            mealSchedules.push({
              dining_hall: diningHallName as DiningHall,
              meal_type: mealType,
              start_time: convertToTimestamptz(mealInfo.start_time, today),
              end_time: convertToTimestamptz(mealInfo.end_time, today),
              created_at: now,
            });
          }

          mealInfo.menu.forEach((itemName) => {
            const key = `${itemName}|${diningHallName}`;

            if (itemsMap.has(key)) {
              // add meal type to existing item
              const existing = itemsMap.get(key)!;
              if (!existing.meal_types.includes(mealType)) {
                existing.meal_types.push(mealType);
              }
            } else {
              itemsMap.set(key, {
                name: itemName,
                dining_hall: diningHallName as DiningHall,
                meal_types: [mealType],
                created_at: now,
                updated_at: now,
              });
            }
          });
        }
      );
    }

    const menuItems = Array.from(itemsMap.values());

    await Promise.all([
      createMenuItems(menuItems),
      createMealSchedule(mealSchedules),
    ]);

    return NextResponse.json({
      success: true,
      diningHalls: Object.keys(menuData).length,
      menuItemsSaved: menuItems.length,
      mealSchedulesSaved: mealSchedules.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to scrape and save menu data" },
      { status: 500 }
    );
  }
}
