import { createAdminSupabaseClient } from "@/lib/supabase";
import { MealSchedule, MenuItem } from "@/lib/types";

// for all user, meal schedule, and menu item operations, we use admin client
// which bypasses postgres RLS policies. This is done because all of these are either
// webhooks or cron jobs, which are not authenticated.
const supabaseAdmin = createAdminSupabaseClient();

// ------------------------------------------------
// USER
// ------------------------------------------------
export async function createUser(
  id: string | undefined,
  email: string,
  firstName: string | null,
  lastName: string | null
) {
  await supabaseAdmin.from("user").insert({
    id,
    email,
    first_name: firstName,
    last_name: lastName,
  });
}

export async function updateUser(
  id: string | undefined,
  email: string,
  firstName: string | null,
  lastName: string | null
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

export async function deleteUser(id: string | undefined) {
  await supabaseAdmin.from("user").delete().eq("id", id);
}

// ------------------------------------------------
// MENU ITEM
// ------------------------------------------------
export async function createMenuItems(menuItems: MenuItem[]) {
  await supabaseAdmin.from("menu_item").upsert(menuItems, {
    onConflict: "name,dining_hall",
    ignoreDuplicates: false, // update rows if duplicates found
  });
}

// ------------------------------------------------
// MEAL SCHEDULE
// ------------------------------------------------
export async function createMealSchedule(mealSchedule: MealSchedule[]) {
  await supabaseAdmin.from("meal_schedule").upsert(mealSchedule, {
    onConflict: "dining_hall,meal_type",
    ignoreDuplicates: false, // update rows if duplicates found
  });
}
