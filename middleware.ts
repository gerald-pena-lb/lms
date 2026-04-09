import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const publicRoutes = ["/login", "/forgot-password"];

const roleRoutes: Record<string, string> = {
  student: "/student",
  teacher: "/teacher",
  supervisor: "/supervisor",
  admin: "/admin",
};

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    if (user) {
      const role = user.user_metadata?.role as string | undefined;
      if (role && roleRoutes[role]) {
        const url = request.nextUrl.clone();
        url.pathname = roleRoutes[role];
        return NextResponse.redirect(url);
      }
    }
    return supabaseResponse;
  }

  // Protect all non-public routes
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  const role = user.user_metadata?.role as string | undefined;

  // No role assigned — redirect to onboarding
  if (!role) {
    if (!pathname.startsWith("/onboarding")) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // User has role but hasn't completed onboarding
  if (!user.user_metadata?.onboarded_at && !pathname.startsWith("/onboarding")) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  // Role-based access control
  for (const [routeRole, prefix] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(prefix) && role !== routeRole && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = roleRoutes[role] || "/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/webhooks|auth/callback).*)",
  ],
};
