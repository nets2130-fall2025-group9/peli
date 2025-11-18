"use server";

import { UPENN_DOMAIN } from "@/lib/constants";

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
