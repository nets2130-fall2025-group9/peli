import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/login",
  "/signup",
  "/forgot-password",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth(); // allow cron jobs to bypass Clerk auth by checking for cron secret

  if (req.nextUrl.pathname === "/api/scrape") {
    // only check authorization in prod
    if (process.env.NODE_ENV === "production") {
      const authHeader = req.headers.get("authorization");
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    return NextResponse.next();
  } // user is not authenticated and trying to access a protected route

  if (!userId && !isPublicRoute(req)) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  } // user is authenticated and trying to access login page, redirect to home

  const { isAuthenticated } = await auth();
  if (isAuthenticated && isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
