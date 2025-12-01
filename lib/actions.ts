"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { UPENN_DOMAIN } from "@/lib/constants";
import { Rating } from "@/lib/types";
import { getUserRatings as getUserRatingsFromDB } from "@/supabase/db";

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
