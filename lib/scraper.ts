import * as cheerio from "cheerio";
import { DINING_HALL_URLS } from "@/lib/constants";

export type MealData = Record<string, string[]>;
export type DiningHallData = Record<string, MealData>;

export async function scrapeDiningHalls(): Promise<DiningHallData> {
  const allDiningHallData: DiningHallData = {};

  await Promise.all(
    Object.entries(DINING_HALL_URLS).map(
      async ([diningHallName, url]: [string, string]) => {
        const response = await fetch(url);
        const html = await response.text();

        const $ = cheerio.load(html);

        const mealData: MealData = {};

        // for each daypart panel
        $("section.panel.s-wrapper.site-panel.site-panel--daypart").each(
          (index, section) => {
            const $section = $(section);

            // get meal name
            const mealName = $section.attr("data-jump-nav-title");

            if (!mealName) return;

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
              mealData[mealName.toLowerCase()] = items;
            }
          }
        );

        allDiningHallData[diningHallName] = mealData;
      }
    )
  );

  return allDiningHallData;
}