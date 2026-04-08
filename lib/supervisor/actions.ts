"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/actions";
import {
  createCourseSchema,
  updateCourseSchema,
  createModuleSchema,
  updateModuleSchema,
  createLessonSchema,
  updateLessonSchema,
  createActivitySchema,
  updateActivitySchema,
  type CreateCourseInput,
  type UpdateCourseInput,
  type CreateModuleInput,
  type UpdateModuleInput,
  type CreateLessonInput,
  type UpdateLessonInput,
  type CreateActivityInput,
  type UpdateActivityInput,
} from "@/lib/validators/supervisor";
import type { ContentStatus, ActivityType } from "@/types/database";

// ============================================================
// Dashboard Stats
// ============================================================

export async function getSupervisorStats() {
  const supabase = await createClient();

  const [courses, publishedCourses, teachers, draftContent] = await Promise.all([
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("status", "draft"),
  ]);

  return {
    totalCourses: courses.count ?? 0,
    publishedCourses: publishedCourses.count ?? 0,
    teachers: teachers.count ?? 0,
    draftContent: draftContent.count ?? 0,
  };
}

// ============================================================
// Courses
// ============================================================

export async function getCourses() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*, schools(name), profiles!courses_created_by_fkey(full_name)")
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

export async function getCourseWithDetails(courseId: string) {
  const supabase = await createClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*, schools(name)")
    .eq("id", courseId)
    .single();

  if (courseError) return { data: null, error: courseError.message };

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  const moduleIds = (modules ?? []).map((m) => m.id);

  let lessons: typeof lessonsResult.data = [];
  let lessonsResult = { data: [] as Array<{ id: string; module_id: string; title: string; description: string | null; sort_order: number; status: string; teacher_notes: string | null; timing_guide: string | null; content_json: unknown; created_at: string; updated_at: string }> };
  if (moduleIds.length > 0) {
    lessonsResult = await supabase
      .from("lessons")
      .select("*")
      .in("module_id", moduleIds)
      .order("sort_order", { ascending: true }) as typeof lessonsResult;
    lessons = lessonsResult.data ?? [];
  }

  const lessonIds = lessons.map((l) => l.id);

  let activities: Array<{ id: string; lesson_id: string; title: string; type: string; sort_order: number; points: number; time_limit_seconds: number | null; config_json: unknown; created_at: string; updated_at: string }> = [];
  if (lessonIds.length > 0) {
    const result = await supabase
      .from("activities")
      .select("*")
      .in("lesson_id", lessonIds)
      .order("sort_order", { ascending: true });
    activities = (result.data ?? []) as typeof activities;
  }

  return {
    data: {
      course,
      modules: modules ?? [],
      lessons,
      activities,
    },
    error: null,
  };
}

export async function createCourse(data: CreateCourseInput) {
  const parsed = createCourseSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase.from("courses").insert({
    title: parsed.data.title,
    description: parsed.data.description || null,
    level: parsed.data.level || null,
    school_id: parsed.data.school_id || null,
    created_by: profile.id,
    status: "draft" as ContentStatus,
  });

  if (error) return { error: error.message };

  revalidatePath("/supervisor/courses");
  return { error: null };
}

export async function updateCourse(id: string, data: UpdateCourseInput) {
  const parsed = updateCourseSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      level: parsed.data.level || null,
      school_id: parsed.data.school_id || null,
      status: parsed.data.status as ContentStatus,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/supervisor/courses");
  revalidatePath(`/supervisor/courses/${id}`);
  return { error: null };
}

export async function deleteCourse(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/supervisor/courses");
  return { error: null };
}

// ============================================================
// Modules
// ============================================================

export async function createModule(data: CreateModuleInput) {
  const parsed = createModuleSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const supabase = await createClient();

  // Get next sort_order
  const { data: existing } = await supabase
    .from("modules")
    .select("sort_order")
    .eq("course_id", parsed.data.course_id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("modules").insert({
    course_id: parsed.data.course_id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    sort_order: nextOrder,
    status: "draft" as ContentStatus,
  });

  if (error) return { error: error.message };

  revalidatePath(`/supervisor/courses/${parsed.data.course_id}`);
  return { error: null };
}

export async function updateModule(id: string, courseId: string, data: UpdateModuleInput) {
  const parsed = updateModuleSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("modules")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status as ContentStatus,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/supervisor/courses/${courseId}`);
  return { error: null };
}

export async function deleteModule(id: string, courseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("modules").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/supervisor/courses/${courseId}`);
  return { error: null };
}

// ============================================================
// Lessons
// ============================================================

export async function createLesson(data: CreateLessonInput, courseId: string) {
  const parsed = createLessonSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("lessons")
    .select("sort_order")
    .eq("module_id", parsed.data.module_id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("lessons").insert({
    module_id: parsed.data.module_id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    teacher_notes: parsed.data.teacher_notes || null,
    timing_guide: parsed.data.timing_guide || null,
    sort_order: nextOrder,
    status: "draft" as ContentStatus,
  });

  if (error) return { error: error.message };

  revalidatePath(`/supervisor/courses/${courseId}`);
  return { error: null };
}

export async function updateLesson(id: string, courseId: string, data: UpdateLessonInput) {
  const parsed = updateLessonSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      teacher_notes: parsed.data.teacher_notes || null,
      timing_guide: parsed.data.timing_guide || null,
      status: parsed.data.status as ContentStatus,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/supervisor/courses/${courseId}`);
  return { error: null };
}

export async function deleteLesson(id: string, courseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/supervisor/courses/${courseId}`);
  return { error: null };
}

// ============================================================
// Activities
// ============================================================

export async function createActivity(data: CreateActivityInput, courseId: string) {
  const parsed = createActivitySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("activities")
    .select("sort_order")
    .eq("lesson_id", parsed.data.lesson_id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("activities").insert({
    lesson_id: parsed.data.lesson_id,
    title: parsed.data.title,
    type: parsed.data.type as ActivityType,
    points: parsed.data.points,
    time_limit_seconds: parsed.data.time_limit_seconds ? Number(parsed.data.time_limit_seconds) : null,
    sort_order: nextOrder,
  });

  if (error) return { error: error.message };

  revalidatePath(`/supervisor/courses/${courseId}`);
  return { error: null };
}

export async function updateActivity(id: string, courseId: string, data: UpdateActivityInput) {
  const parsed = updateActivitySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("activities")
    .update({
      title: parsed.data.title,
      type: parsed.data.type as ActivityType,
      points: parsed.data.points,
      time_limit_seconds: parsed.data.time_limit_seconds ? Number(parsed.data.time_limit_seconds) : null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/supervisor/courses/${courseId}`);
  return { error: null };
}

export async function deleteActivity(id: string, courseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/supervisor/courses/${courseId}`);
  return { error: null };
}
