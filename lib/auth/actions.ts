"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  loginSchema,
  forgotPasswordSchema,
  onboardingSchema,
  type LoginInput,
  type ForgotPasswordInput,
  type OnboardingInput,
} from "@/lib/validators/auth";
import type { UserRole } from "@/types/database";

const roleRoutes: Record<string, string> = {
  student: "/student",
  teacher: "/teacher",
  supervisor: "/supervisor",
  admin: "/admin",
};

export async function login(data: LoginInput) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string | undefined;
  const destination = role && roleRoutes[role] ? roleRoutes[role] : "/onboarding";

  redirect(destination);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPassword(data: ForgotPasswordInput) {
  const parsed = forgotPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid email address" };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  });

  // Always return undefined — don't leak whether email exists
  return undefined;
}

export async function completeOnboarding(data: OnboardingInput) {
  const parsed = onboardingSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const adminClient = createAdminClient();
  const { error: profileError } = await adminClient
    .from("profiles")
    .upsert({
      id: user.id,
      full_name: parsed.data.full_name,
      email: user.email!,
      role: ((user.user_metadata?.role as string) || "student") as UserRole,
      onboarded_at: new Date().toISOString(),
    }, { onConflict: "id" });

  if (profileError) {
    return { error: "Failed to update profile" };
  }

  // Update user_metadata so middleware can check onboarded_at without a DB query
  await supabase.auth.updateUser({
    data: {
      full_name: parsed.data.full_name,
      onboarded_at: new Date().toISOString(),
    },
  });

  const role = user.user_metadata?.role as string | undefined;
  const destination = role && roleRoutes[role] ? roleRoutes[role] : "/student";

  redirect(destination);
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url")
    .eq("id", user.id)
    .single();

  return profile;
}
