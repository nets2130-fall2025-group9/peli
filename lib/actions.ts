"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { UPENN_DOMAIN } from "@/lib/constants";
import {
  DiningHall,
  DiningHallDB,
  MealScheduleDB,
  MenuItemDB,
  MenuItemWithStats,
  MenuItemRating,
  Rating,
} from "@/lib/types";
import {
  getDiningHalls as getDiningHallsFromDB,
  getUserRatings as getUserRatingsFromDB,
  getDailyMealSchedule as getDailyMealScheduleFromDB,
  getMenuItems as getMenuItemsFromDB,
  getMenuItemsWithStats as getMenuItemsWithStatsFromDB,
  getMenuItemWithStats as getMenuItemWithStatsFromDB,
  getMenuItemRatings as getMenuItemRatingsFromDB,
  getUserRatingForMenuItem as getUserRatingForMenuItemFromDB,
} from "@/supabase/db";

export async function validatePennEmail(email: string) {
  if (!email || typeof email !== "string") {
    return {
      success: false,
      error: "Email is required",
    };
  }

  const emailDomain = email.split("@")[1];

  if (!emailDomain || !emailDomain.endsWith(UPENN_DOMAIN)) {
    return {
      success: false,
      error: "Please use your Penn email address to sign up",
    };
  }

  return {
    success: true,
    message: "Email domain validated successfully",
  };
}

export async function getUserProfile(userId: string | null, id: string) {
  const client = await clerkClient();
  const profileUser = await client.users.getUser(id);

  const isOwnProfile = userId === id;

  return {
    firstName: profileUser.firstName,
    lastName: profileUser.lastName,
    emailAddress:
      profileUser.emailAddresses.find(
        (email) => email.id === profileUser.primaryEmailAddressId
      )?.emailAddress || "",
    isOwnProfile,
  };
}
export async function updateUserProfile(data: {
  firstName: string;
  lastName: string;
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const client = await clerkClient();
    await client.users.updateUser(userId, {
      firstName: data.firstName,
      lastName: data.lastName,
    });

    revalidatePath(`/account/${userId}`);

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to update profile",
    };
  }
}

export async function deleteUserAccount() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const client = await clerkClient();
    await client.users.deleteUser(userId);

    return {
      success: true,
      message: "Account deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to delete account",
    };
  }
}

export async function getUserRatings(userId: string): Promise<{
  success: boolean;
  error?: string;
  ratings: Rating[];
  summary: { totalRatings: number; averageRating: number };
}> {
  try {
    const ratings = await getUserRatingsFromDB(userId);

    const totalRatings = ratings?.length || 0;
    const averageRating =
      totalRatings > 0
        ? ratings.reduce((sum, rating) => sum + (rating.rating || 0), 0) /
          totalRatings
        : 0;

    return {
      success: true,
      ratings: ratings || [],
      summary: {
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch ratings",
      ratings: [],
      summary: {
        totalRatings: 0,
        averageRating: 0,
      },
    };
  }
}

export async function getDiningHalls(): Promise<{
  success: boolean;
  error?: string;
  diningHalls: DiningHallDB[];
}> {
  try {
    const diningHalls = await getDiningHallsFromDB();
    return {
      success: true,
      diningHalls: diningHalls || [],
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch dining halls",
      diningHalls: [],
    };
  }
}

export async function getDailyMealSchedule(diningHall: DiningHall): Promise<{
  success: boolean;
  error?: string;
  mealSchedule: MealScheduleDB[];
}> {
  try {
    const mealSchedule = await getDailyMealScheduleFromDB(diningHall);
    const currentDatetime = new Date();
    const mealScheduleWithStatus = mealSchedule.map((meal) => ({
      ...meal,
      isActive: new Date(meal.start_time) <= currentDatetime,
    }));

    return {
      success: true,
      mealSchedule: mealScheduleWithStatus || [],
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch meal schedule",
      mealSchedule: [],
    };
  }
}

export async function getMenuItems(
  diningHall: DiningHall,
  mealType: string
): Promise<{
  success: boolean;
  error?: string;
  menuItems: MenuItemWithStats[];
}> {
  try {
    const menuItems = await getMenuItemsWithStatsFromDB(diningHall, mealType);
    return {
      success: true,
      menuItems: menuItems || [],
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch menu items",
      menuItems: [],
    };
  }
}

export async function getMenuItem(id: string): Promise<{
  success: boolean;
  error?: string;
  menuItem?: MenuItemWithStats;
}> {
  try {
    const menuItem = await getMenuItemWithStatsFromDB(id);
    return {
      success: true,
      menuItem,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch menu item",
    };
  }
}

export async function getMenuItemRatings(menuItemId: string): Promise<{
  success: boolean;
  error?: string;
  ratings: MenuItemRating[];
}> {
  try {
    const ratings = await getMenuItemRatingsFromDB(menuItemId);
    return {
      success: true,
      ratings: ratings || [],
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch ratings",
      ratings: [],
    };
  }
}

export async function checkUserHasRated(
  userId: string | null,
  menuItemId: string
): Promise<{
  success: boolean;
  hasRated: boolean;
  error?: string;
}> {
  try {
    if (!userId) {
      return {
        success: true,
        hasRated: false,
      };
    }

    const rating = await getUserRatingForMenuItemFromDB(userId, menuItemId);
    return {
      success: true,
      hasRated: !!rating,
    };
  } catch (error) {
    return {
      success: false,
      hasRated: false,
      error: "Failed to check rating status",
    };
  }
}
