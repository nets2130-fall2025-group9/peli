import {
  createSupabaseClient,
  createAdminSupabaseClient,
} from "@/lib/supabase";
import { MealScheduleDB, MenuItemDB, Rating } from "@/lib/types";

const supabase = createSupabaseClient();

// for all user, meal schedule, and menu item operations, we use admin client
// which bypasses postgres RLS policies. This is done because all of these are either
// webhooks or cron jobs, which are not authenticated.
const supabaseAdmin = createAdminSupabaseClient();

// ------------------------------------------------
// USER
// ------------------------------------------------
export async function createUser(
  id: string,
  email: string,
  firstName: string,
  lastName: string
) {
  await supabaseAdmin.from("user").insert({
    id,
    email,
    first_name: firstName,
    last_name: lastName,
  });
}

export async function updateUser(
  id: string,
  email: string,
  firstName: string,
  lastName: string
) {
  await supabaseAdmin
    .from("user")
    .update({
      email,
      first_name: firstName,
      last_name: lastName,
    })
    .eq("id", id);
}

export async function deleteUser(id: string) {
  await supabaseAdmin.from("user").delete().eq("id", id);
}

// ------------------------------------------------
// MENU ITEM
// ------------------------------------------------
export async function createMenuItems(menuItems: MenuItemDB[]) {
  await supabaseAdmin.from("menu_item").upsert(menuItems, {
    onConflict: "name,dining_hall",
    ignoreDuplicates: false, // update rows if duplicates found
  });
}

// ------------------------------------------------
// MEAL SCHEDULE
// ------------------------------------------------
export async function createMealSchedule(mealSchedule: MealScheduleDB[]) {
  await supabaseAdmin.from("meal_schedule").upsert(mealSchedule, {
    onConflict: "dining_hall,meal_type",
    ignoreDuplicates: false, // update rows if duplicates found
  });
}

// ------------------------------------------------
// RATING
// ------------------------------------------------
export async function getUserRatings(userId: string): Promise<Rating[]> {
  const { data, error } = await supabase
    .from("rating")
    .select(
      `
      id,
      user_id,
      menu_item_id,
      rating,
      description,
      image_path,
      created_at,
      menu_item (
        name,
        dining_hall
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}
