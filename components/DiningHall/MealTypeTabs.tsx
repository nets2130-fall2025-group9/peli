"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getMenuItems } from "@/lib/actions";
import { DiningHall, MealScheduleDB, MenuItemWithStats } from "@/lib/types";
import MenuItemsGrid from "@/components/DiningHall/MenuItemsGrid";

type MealScheduleWithStatus = MealScheduleDB & { isActive: boolean };

type SortOption =
  | "name-asc"
  | "rating-desc"
  | "rating-asc"
  | "ratings-desc"
  | "ratings-asc";

interface Props {
  mealSchedule: MealScheduleWithStatus[];
  selectedMealType: string;
  onMealTypeChange: (mealType: string) => void;
  diningHall: DiningHall;
}

export default function MealTypeTabs({
  mealSchedule,
  selectedMealType,
  onMealTypeChange,
  diningHall,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");

  const selectedMeal = mealSchedule.find(
    (meal) => meal.meal_type === selectedMealType
  );
  const isSelectedMealActive = selectedMeal?.isActive ?? false;

  const { data: menuItems = [], isLoading: isLoadingMenuItems } = useQuery({
    queryKey: ["menuItems", diningHall, selectedMealType],
    queryFn: async () => {
      const result = await getMenuItems(diningHall, selectedMealType);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.menuItems;
    },
    enabled: !!selectedMealType && isSelectedMealActive,
  });

  // Filter and sort menu items based on search query and sort option
  const filteredAndSortedMenuItems = useMemo(() => {
    // First filter by search query
    let filtered = menuItems;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = menuItems.filter((item) =>
        item.name.toLowerCase().includes(query)
      );
    }

    // Then sort based on sort option
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "rating-desc":
          return b.averageRating - a.averageRating;
        case "rating-asc":
          return a.averageRating - b.averageRating;
        case "ratings-desc":
          return b.totalRatings - a.totalRatings;
        case "ratings-asc":
          return a.totalRatings - b.totalRatings;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return sorted;
  }, [menuItems, searchQuery, sortOption]);

  const formatMealType = (mealType: string) => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  if (mealSchedule.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">
          No meal schedule available for this dining hall.
        </p>
      </div>
    );
  }

  return (
    <Tabs
      value={selectedMealType}
      onValueChange={onMealTypeChange}
      className="w-full"
    >
      <TabsList className="mb-6 w-full justify-start overflow-x-auto">
        {mealSchedule.map((meal) => (
          <TabsTrigger
            key={meal.meal_type}
            value={meal.meal_type}
            disabled={!meal.isActive}
            className="flex-shrink-0"
          >
            {formatMealType(meal.meal_type)}
            {!meal.isActive && (
              <span className="ml-2 text-xs opacity-60">(Not Available)</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {selectedMealType ? (
        <TabsContent value={selectedMealType} className="mt-0">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:flex-1"
            />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] sm:w-auto dark:bg-input/30"
            >
              <option value="name-asc">Sort by Name (A-Z)</option>
              <option value="rating-desc">Sort by Rating (High to Low)</option>
              <option value="rating-asc">Sort by Rating (Low to High)</option>
              <option value="ratings-desc">Sort by # Ratings (Most)</option>
              <option value="ratings-asc">Sort by # Ratings (Least)</option>
            </select>
          </div>
          <MenuItemsGrid
            menuItems={filteredAndSortedMenuItems}
            isLoading={isLoadingMenuItems}
          />
        </TabsContent>
      ) : (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            No active meals available for this dining hall at this time.
          </p>
        </div>
      )}
    </Tabs>
  );
}
