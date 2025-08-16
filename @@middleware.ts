import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/game(.*)",
  "/games(.*)",
  "/practice-drills(.*)",
  "/swing-tips(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/api/webhook(.*)",
  "/manifest.json",
  "/sw.js",
  "/favicon-192.png",
  "/favicon-512.png",
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect specific routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return;
  }

  // Protect all other routes by default (including root route)
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
