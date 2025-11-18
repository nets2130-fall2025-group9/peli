import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/login",
  "/signup",
  "/forgot-password",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // user is not authenticated and trying to access a protected route
  if (!userId && !isPublicRoute(req)) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // user is authenticated and trying to access login page, redirect to home
  const { isAuthenticated } = await auth();
  if (isAuthenticated && isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
