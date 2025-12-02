"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MealTypeTabs from "@/components/DiningHall/MealTypeTabs";
import { DiningHall, DiningHallDB, MealScheduleDB } from "@/lib/types";
import { getDailyMealSchedule } from "@/lib/actions";

type MealScheduleWithStatus = MealScheduleDB & { isActive: boolean };

interface Props {
  diningHalls: DiningHallDB[];
  initialDiningHall: DiningHall;
}

export default function DiningHallMenu({
  diningHalls,
  initialDiningHall,
}: Props) {
  const [selectedDiningHall, setSelectedDiningHall] =
    useState<DiningHall>(initialDiningHall);
  const [selectedMealType, setSelectedMealType] = useState<string>("");

  const {
    data: mealScheduleData,
    isLoading: isLoadingMealSchedule,
  } = useQuery({
    queryKey: ["mealSchedule", selectedDiningHall],
    queryFn: async () => {
      const result = await getDailyMealSchedule(selectedDiningHall);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.mealSchedule as MealScheduleWithStatus[];
    },
  });

  const mealSchedule = mealScheduleData || [];

  useEffect(() => {
    if (!mealSchedule.length) {
      setSelectedMealType("");
      return;
    }

    // find latest available active meal type
    const activeMeals = mealSchedule
      .filter((meal) => meal.isActive)
      .sort(
        (a, b) =>
          new Date(b.start_time).getTime() -
          new Date(a.start_time).getTime()
      );

    if (activeMeals.length > 0) {
      setSelectedMealType(activeMeals[0].meal_type);
    } else {
      setSelectedMealType("");
    }
  }, [mealSchedule]);

  const formatDiningHallName = (name: string) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleDiningHallChange = (value: string) => {
    setSelectedDiningHall(value as DiningHall);
    setSelectedMealType(""); // clear meal type when switching dining halls
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black pt-16">
      <div className="container mx-auto px-4 py-8">
        <Tabs
          value={selectedDiningHall}
          onValueChange={handleDiningHallChange}
          className="w-full"
        >
          <TabsList className="mb-6 w-full justify-start overflow-x-auto">
            {diningHalls.map((hall) => (
              <TabsTrigger key={hall.name} value={hall.name} className="flex-shrink-0">
                {formatDiningHallName(hall.name)}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={selectedDiningHall} className="mt-0">
            {isLoadingMealSchedule ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <MealTypeTabs
                mealSchedule={mealSchedule}
                selectedMealType={selectedMealType}
                onMealTypeChange={setSelectedMealType}
                diningHall={selectedDiningHall}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

