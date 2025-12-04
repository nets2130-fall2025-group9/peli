import {
  createSupabaseClient,
  createAdminSupabaseClient,
} from "@/lib/supabase";
import {
  DiningHall,
  DiningHallDB,
  MealScheduleDB,
  MenuItemDB,
  Rating,
} from "@/lib/types";

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
      reports,
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

export async function getMenuItemRatings(menuItemId: string) {
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
      reports,
      user (
        first_name,
        last_name
      )
    `
    )
    .eq("menu_item_id", menuItemId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getUserRatingForMenuItem(
  userId: string,
  menuItemId: string
) {
  const { data, error } = await supabase
    .from("rating")
    .select("*")
    .eq("user_id", userId)
    .eq("menu_item_id", menuItemId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found" error
    throw error;
  }

  return data || null;
}

export async function getDiningHalls(): Promise<DiningHallDB[]> {
  const { data, error } = await supabase.from("dining_hall").select("*");

  if (error) {
    throw error;
  }

  return data;
}

export async function getDailyMealSchedule(
  diningHall: DiningHall
): Promise<MealScheduleDB[]> {
  const { data, error } = await supabase
    .from("meal_schedule")
    .select("*")
    .eq("dining_hall", diningHall);

  if (error) {
    throw error;
  }

  return data;
}

export async function getMenuItems(
  diningHall: DiningHall,
  mealType: string
): Promise<MenuItemDB[]> {
  const { data, error } = await supabase
    .from("menu_item")
    .select("*")
    .eq("dining_hall", diningHall)
    .contains("meal_types", [mealType])
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getMenuItemsWithStats(
  diningHall: DiningHall,
  mealType: string
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: menuItems, error: menuItemsError } = await supabase
    .from("menu_item")
    .select("*")
    .eq("dining_hall", diningHall)
    .contains("meal_types", [mealType])
    .gte("updated_at", today.toISOString())
    .order("name", { ascending: true });

  if (menuItemsError) {
    throw menuItemsError;
  }

  if (!menuItems || menuItems.length === 0) {
    return [];
  }

  // Get rating statistics for each menu item
  const menuItemIds = menuItems.map((item) => item.id);
  const { data: ratings, error: ratingsError } = await supabase
    .from("rating")
    .select("menu_item_id, rating")
    .in("menu_item_id", menuItemIds);

  if (ratingsError) {
    throw ratingsError;
  }

  // Calculate stats for each menu item
  const menuItemsWithStats = menuItems.map((item) => {
    const itemRatings =
      ratings?.filter((r) => r.menu_item_id === item.id) || [];
    const totalRatings = itemRatings.length;
    const averageRating =
      totalRatings > 0
        ? itemRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;

    return {
      ...item,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalRatings,
    };
  });

  return menuItemsWithStats;
}

export async function getMenuItemById(id: string) {
  const { data, error } = await supabase
    .from("menu_item")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getMenuItemWithStats(id: string) {
  const menuItem = await getMenuItemById(id);

  // Get rating statistics
  const { data: ratings, error: ratingsError } = await supabase
    .from("rating")
    .select("rating")
    .eq("menu_item_id", id);

  if (ratingsError) {
    throw ratingsError;
  }

  const totalRatings = ratings?.length || 0;
  const averageRating =
    totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

  return {
    ...menuItem,
    averageRating: Math.round(averageRating * 10) / 10,
    totalRatings,
  };
}

// ------------------------------------------------
// LEADERBOARD
// ------------------------------------------------
export async function getTopUsers(limit: number = 10) {
  const { data, error } = await supabase
    .from("rating")
    .select("user_id, user(first_name, last_name)")
    .order("user_id");

  if (error) {
    throw error;
  }

  // Group by user and count reviews
  const userReviewCounts = data.reduce((acc: any, rating: any) => {
    const userId = rating.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        userId,
        firstName: rating.user?.first_name || "Unknown",
        lastName: rating.user?.last_name || "",
        reviewCount: 0,
      };
    }
    acc[userId].reviewCount += 1;
    return acc;
  }, {});

  // Convert to array and sort by review count
  const topUsers = Object.values(userReviewCounts)
    .sort((a: any, b: any) => b.reviewCount - a.reviewCount)
    .slice(0, limit);

  return topUsers;
}

export async function getTopMenuItems(limit: number = 10) {
  // Get all menu items with their ratings
  const { data: menuItems, error: menuItemsError } = await supabase
    .from("menu_item")
    .select("*");

  if (menuItemsError) {
    throw menuItemsError;
  }

  if (!menuItems || menuItems.length === 0) {
    return [];
  }

  // Get all ratings for these menu items
  const { data: ratings, error: ratingsError } = await supabase
    .from("rating")
    .select("menu_item_id, rating");

  if (ratingsError) {
    throw ratingsError;
  }

  // Calculate stats for each menu item
  const menuItemsWithStats = menuItems
    .map((item) => {
      const itemRatings =
        ratings?.filter((r) => r.menu_item_id === item.id) || [];
      const totalRatings = itemRatings.length;
      const averageRating =
        totalRatings > 0
          ? itemRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
          : 0;

      return {
        ...item,
        averageRating: Math.round(averageRating * 100) / 100, // Keep more precision for sorting
        totalRatings,
      };
    })
    .filter((item) => item.totalRatings > 0); // Only include items with ratings

  // Sort by: 1) average rating (desc), 2) total ratings (desc), 3) name (asc)
  const topMenuItems = menuItemsWithStats
    .sort((a, b) => {
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      if (b.totalRatings !== a.totalRatings) {
        return b.totalRatings - a.totalRatings;
      }
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit)
    .map((item) => ({
      ...item,
      averageRating: Math.round(item.averageRating * 10) / 10, // Round to 1 decimal for display
    }));

  return topMenuItems;
}
