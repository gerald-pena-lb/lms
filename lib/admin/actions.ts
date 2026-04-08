"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createUserSchema,
  updateUserSchema,
  createSchoolSchema,
  updateSchoolSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type CreateSchoolInput,
  type UpdateSchoolInput,
} from "@/lib/validators/admin";
import type { UserRole } from "@/types/database";

// ============================================================
// Dashboard
// ============================================================

export async function getDashboardStats() {
  const supabase = await createClient();

  const [students, teachers, schools, courses] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("schools").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
  ]);

  return {
    students: students.count ?? 0,
    teachers: teachers.count ?? 0,
    schools: schools.count ?? 0,
    courses: courses.count ?? 0,
  };
}

// ============================================================
// Users
// ============================================================

export async function getUsers(search?: string, roleFilter?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url, school_id, is_active, created_at, schools(name)")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  if (roleFilter && roleFilter !== "all") {
    query = query.eq("role", roleFilter as UserRole);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data ?? [], error: null };
}

export async function createUser(data: CreateUserInput) {
  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const adminClient = createAdminClient();

  // Create auth user (trigger will auto-create profile)
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.full_name,
      role: parsed.data.role,
      onboarded_at: new Date().toISOString(),
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  // Update profile with school_id and onboarded_at (trigger may not set these)
  if (authData.user) {
    const schoolId = parsed.data.school_id || null;
    await adminClient
      .from("profiles")
      .update({
        school_id: schoolId,
        onboarded_at: new Date().toISOString(),
      })
      .eq("id", authData.user.id);
  }

  revalidatePath("/admin/users");
  return { error: null };
}

export async function updateUser(id: string, data: UpdateUserInput) {
  const parsed = updateUserSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const adminClient = createAdminClient();

  // Update auth user metadata
  const { error: authError } = await adminClient.auth.admin.updateUserById(id, {
    email: parsed.data.email,
    user_metadata: {
      full_name: parsed.data.full_name,
      role: parsed.data.role,
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  // Update profile
  const { error: profileError } = await adminClient
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      role: parsed.data.role as UserRole,
      school_id: parsed.data.school_id || null,
      is_active: parsed.data.is_active,
    })
    .eq("id", id);

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/admin/users");
  return { error: null };
}

export async function toggleUserActive(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  return { error: null };
}

// ============================================================
// Schools
// ============================================================

export async function getSchools() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data ?? [], error: null };
}

export async function createSchool(data: CreateSchoolInput) {
  const parsed = createSchoolSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("schools").insert({
    name: parsed.data.name,
    code: parsed.data.code,
    address: parsed.data.address || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A school with this code already exists" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/schools");
  return { error: null };
}

export async function updateSchool(id: string, data: UpdateSchoolInput) {
  const parsed = updateSchoolSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("schools")
    .update({
      name: parsed.data.name,
      code: parsed.data.code,
      address: parsed.data.address || null,
      is_active: parsed.data.is_active,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "A school with this code already exists" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/schools");
  return { error: null };
}
