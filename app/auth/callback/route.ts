import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role as string | undefined;

      const roleRoutes: Record<string, string> = {
        student: "/student",
        teacher: "/teacher",
        supervisor: "/supervisor",
        admin: "/admin",
      };

      const destination =
        role && roleRoutes[role] ? roleRoutes[role] : "/onboarding";
      return NextResponse.redirect(new URL(destination, origin));
    }
  }

  return NextResponse.redirect(new URL("/login", origin));
}
