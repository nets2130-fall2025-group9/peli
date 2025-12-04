import { SignInResource, SignUpResource } from "@clerk/types";
import { Database } from "@/supabase/types";

export type Auth = {
  isLoaded: boolean;
  signIn?: SignInResource | undefined;
  signUp?: SignUpResource | undefined;
  setActive:
    | ((config: { session: string | null }) => Promise<void>)
    | undefined;
};

//------------------------------------------------
// TYPES IDENTICAL TO DATABASE TABLES (use for direct database operations)
//------------------------------------------------
export type MenuItemDB = Database["public"]["Tables"]["menu_item"]["Row"];
export type MealScheduleDB =
  Database["public"]["Tables"]["meal_schedule"]["Row"];
export type UserDB = Database["public"]["Tables"]["user"]["Row"];
export type RatingDB = Database["public"]["Tables"]["rating"]["Row"];
export type DiningHallDB = Database["public"]["Tables"]["dining_hall"]["Row"];

//------------------------------------------------
// TYPES NOT IDENTICAL TO DATABASE TABLES (use for frontend operations)
//------------------------------------------------
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

export type Rating = RatingDB & {
  menu_item: {
    name: string;
    dining_hall: string;
  };
};

export type MenuItemRating = RatingDB & {
  user: {
    first_name: string;
    last_name: string;
  } | null;
};

export type MenuItemWithStats = MenuItemDB & {
  averageRating: number;
  totalRatings: number;
};

export type TopUser = {
  userId: string;
  firstName: string;
  lastName: string;
  reviewCount: number;
};
