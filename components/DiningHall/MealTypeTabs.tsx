"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getMenuItems } from "@/lib/actions";
import { DiningHall, MealScheduleDB, MenuItemWithStats } from "@/lib/types";
import MenuItemsGrid from "@/components/DiningHall/MenuItemsGrid";

type MealScheduleWithStatus = MealScheduleDB & { isActive: boolean };

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

  // Filter menu items based on search query
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return menuItems;
    }
    const query = searchQuery.toLowerCase().trim();
    return menuItems.filter((item) => item.name.toLowerCase().includes(query));
  }, [menuItems, searchQuery]);

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
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <MenuItemsGrid
            menuItems={filteredMenuItems}
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
