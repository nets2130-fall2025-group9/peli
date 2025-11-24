import * as cheerio from "cheerio";
import { DINING_HALL_URLS } from "@/lib/constants";
import { DiningHallData, MealData } from "@/lib/types";

export async function scrapeDiningHalls(): Promise<DiningHallData> {
  const allDiningHallData: DiningHallData = Object.keys(
    DINING_HALL_URLS
  ).reduce((acc, diningHall) => {
    acc[diningHall as keyof DiningHallData] = {
      breakfast: { start_time: "", end_time: "", menu: [] },
      lunch: { start_time: "", end_time: "", menu: [] },
      dinner: { start_time: "", end_time: "", menu: [] },
      brunch: { start_time: "", end_time: "", menu: [] },
    };
    return acc;
  }, {} as DiningHallData);

  await Promise.all(
    Object.entries(DINING_HALL_URLS).map(
      async ([diningHallName, url]: [string, string]) => {
        const response = await fetch(url);
        const html = await response.text();

        const $ = cheerio.load(html);

        const mealData: MealData = {
          breakfast: { start_time: "", end_time: "", menu: [] },
          lunch: { start_time: "", end_time: "", menu: [] },
          dinner: { start_time: "", end_time: "", menu: [] },
          brunch: { start_time: "", end_time: "", menu: [] },
        };

        // for each daypart panel
        $("section.panel.s-wrapper.site-panel.site-panel--daypart").each(
          (index, section) => {
            const $section = $(section);

            // get meal name
            const mealName = $section.attr("data-jump-nav-title");

            if (!mealName) return;

            // get meal time
            const timeText = $section
              .find("div.site-panel__daypart-time")
              .text()
              .trim();
            
            // parse start and end time (format: "7:00 am - 10:00 am")
            let start_time = "";
            let end_time = "";
            if (timeText) {
              const timeParts = timeText.split("-").map(t => t.trim());
              if (timeParts.length === 2) {
                start_time = timeParts[0];
                end_time = timeParts[1];
              }
            }

            // get all menu items from the div with aria-hidden="false"
            const items: string[] = [];
            $section
              .find(
                'div.c-tab__content.site-panel__daypart-tab-content[aria-hidden="false"]'
              )
              .find("button.h4.site-panel__daypart-item-title")
              .each((i, button) => {
                const text = $(button).text().trim();
                if (text) {
                  items.push(text);
                }
              });

            if (items.length > 0) {
              mealData[mealName.toLowerCase() as keyof typeof mealData] = {
                start_time,
                end_time,
                menu: items,
              };
            }
          }
        );

        allDiningHallData[diningHallName as keyof typeof allDiningHallData] =
          mealData;
      }
    )
  );

  return allDiningHallData;
}
