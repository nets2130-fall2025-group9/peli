import { SignInResource, SignUpResource } from "@clerk/types";

export type Auth = {
  isLoaded: boolean;
  signIn?: SignInResource | undefined;
  signUp?: SignUpResource | undefined;
  setActive:
    | ((config: { session: string | null }) => Promise<void>)
    | undefined;
};

export type DiningHall =
  | "1920-commons"
  | "kings-court-english-house"
  | "falk-dining-commons"
  | "hill-house"
  | "lauder-college-house"
  | "quaker-kitchen";

export type MealType = "breakfast" | "lunch" | "dinner" | "brunch";

export type MealInfo = {
  start_time: string;
  end_time: string;
  menu: string[];
};

export type MealData = Record<MealType, MealInfo>;

export type DiningHallData = Record<DiningHall, MealData>;

export type MenuItem = {
  name: string;
  dining_hall: DiningHall;
  meal_types: MealType[];
  created_at: string;
  updated_at: string;
};

export type MealSchedule = {
  dining_hall: DiningHall;
  meal_type: MealType;
  start_time: string;
  end_time: string;
  created_at: string;
};