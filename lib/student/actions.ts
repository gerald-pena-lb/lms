"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/actions";
import {
  submitActivitySchema,
  type SubmitActivityInput,
} from "@/lib/validators/student";
import type { SubmissionStatus } from "@/types/database";

// ============================================================
// Dashboard Stats
// ============================================================

export async function getStudentStats() {
  const profile = await getCurrentProfile();
  if (!profile) return { classes: 0, completionPct: 0, totalScore: 0, badges: 0 };

  const supabase = await createClient();

  const { data: classStudents } = await supabase
    .from("class_students")
    .select("class_id")
    .eq("student_id", profile.id);

  const classIds = (classStudents ?? []).map((cs) => cs.class_id);

  const [progress, submissions, badgeCount] = await Promise.all([
    supabase.from("student_progress").select("completion_percentage").eq("student_id", profile.id),
    supabase.from("submissions").select("score").eq("student_id", profile.id).eq("status", "graded"),
    supabase.from("student_badges").select("*", { count: "exact", head: true }).eq("student_id", profile.id),
  ]);

  const progressData = progress.data ?? [];
  const avgCompletion = progressData.length > 0
    ? Math.round(progressData.reduce((sum, p) => sum + p.completion_percentage, 0) / progressData.length)
    : 0;

  const totalScore = (submissions.data ?? []).reduce((sum, s) => sum + (s.score ?? 0), 0);

  return {
    classes: classIds.length,
    completionPct: avgCompletion,
    totalScore,
    badges: badgeCount.count ?? 0,
  };
}

// ============================================================
// Classes
// ============================================================

export async function getStudentClasses() {
  const profile = await getCurrentProfile();
  if (!profile) return { data: [], error: "Not authenticated" };

  const supabase = await createClient();

  const { data: classStudents } = await supabase
    .from("class_students")
    .select("class_id")
    .eq("student_id", profile.id);

  const classIds = (classStudents ?? []).map((cs) => cs.class_id);
  if (classIds.length === 0) return { data: [], error: null };

  const { data, error } = await supabase
    .from("classes")
    .select("*, courses(title), schools(name)")
    .in("id", classIds)
    .order("name");

  if (error) return { data: [], error: error.message };

  // Get completion per class
  const { data: progress } = await supabase
    .from("student_progress")
    .select("class_id, completion_percentage")
    .eq("student_id", profile.id)
    .in("class_id", classIds);

  const completionMap: Record<string, { total: number; count: number }> = {};
  for (const p of progress ?? []) {
    if (!completionMap[p.class_id]) completionMap[p.class_id] = { total: 0, count: 0 };
    completionMap[p.class_id].total += p.completion_percentage;
    completionMap[p.class_id].count++;
  }

  const enriched = (data ?? []).map((cls) => ({
    ...cls,
    completion: completionMap[cls.id]
      ? Math.round(completionMap[cls.id].total / completionMap[cls.id].count)
      : 0,
  }));

  return { data: enriched, error: null };
}

export async function getClassLessons(classId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { data: [], error: "Not authenticated" };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lesson_assignments")
    .select("*, lessons(id, title, description)")
    .eq("class_id", classId)
    .order("assigned_at", { ascending: true });

  if (error) return { data: [], error: error.message };

  // Get student progress for these lessons
  const lessonIds = (data ?? []).map((d) => d.lesson_id);
  const { data: progress } = await supabase
    .from("student_progress")
    .select("lesson_id, completion_percentage, completed_at")
    .eq("student_id", profile.id)
    .eq("class_id", classId)
    .in("lesson_id", lessonIds);

  const progressMap: Record<string, { completion_percentage: number; completed_at: string | null }> = {};
  for (const p of progress ?? []) {
    progressMap[p.lesson_id] = { completion_percentage: p.completion_percentage, completed_at: p.completed_at };
  }

  const enriched = (data ?? []).map((a) => ({
    ...a,
    progress: progressMap[a.lesson_id] ?? null,
  }));

  return { data: enriched, error: null };
}

// ============================================================
// Activities
// ============================================================

export async function getStudentActivities() {
  const profile = await getCurrentProfile();
  if (!profile) return { data: [], error: "Not authenticated" };

  const supabase = await createClient();

  // Get student's classes
  const { data: classStudents } = await supabase
    .from("class_students")
    .select("class_id")
    .eq("student_id", profile.id);

  const classIds = (classStudents ?? []).map((cs) => cs.class_id);
  if (classIds.length === 0) return { data: [], error: null };

  // Get assigned lessons for those classes
  const { data: assignments } = await supabase
    .from("lesson_assignments")
    .select("lesson_id, class_id, classes(name)")
    .in("class_id", classIds);

  const lessonIds = (assignments ?? []).map((a) => a.lesson_id);
  if (lessonIds.length === 0) return { data: [], error: null };

  // Get activities for those lessons
  const { data: activities, error } = await supabase
    .from("activities")
    .select("*, lessons(title)")
    .in("lesson_id", lessonIds)
    .order("sort_order");

  if (error) return { data: [], error: error.message };

  // Get student's submissions
  const { data: submissions } = await supabase
    .from("submissions")
    .select("activity_id, status, score, max_score")
    .eq("student_id", profile.id)
    .in("class_id", classIds);

  const subMap: Record<string, { status: string; score: number | null; max_score: number | null }> = {};
  for (const s of submissions ?? []) {
    subMap[s.activity_id] = { status: s.status, score: s.score, max_score: s.max_score };
  }

  // Map class info to lessons
  const lessonClassMap: Record<string, { class_id: string; class_name: string }> = {};
  for (const a of assignments ?? []) {
    lessonClassMap[a.lesson_id] = {
      class_id: a.class_id,
      class_name: (a.classes as { name: string } | null)?.name ?? "",
    };
  }

  const enriched = (activities ?? []).map((act) => ({
    ...act,
    submission: subMap[act.id] ?? null,
    class_info: lessonClassMap[act.lesson_id] ?? null,
  }));

  return { data: enriched, error: null };
}

export async function submitActivity(data: SubmitActivityInput) {
  const parsed = submitActivitySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase.from("submissions").insert({
    activity_id: parsed.data.activity_id,
    student_id: profile.id,
    class_id: parsed.data.class_id,
    response_json: parsed.data.response_json ?? null,
    file_url: parsed.data.file_url || null,
    status: "submitted" as SubmissionStatus,
  });

  if (error) return { error: error.message };

  revalidatePath("/student/activities");
  revalidatePath("/student/assignments");
  return { error: null };
}

// ============================================================
// Assignments
// ============================================================

export async function getStudentAssignments() {
  const profile = await getCurrentProfile();
  if (!profile) return { data: [], error: "Not authenticated" };

  const supabase = await createClient();

  const { data: classStudents } = await supabase
    .from("class_students")
    .select("class_id")
    .eq("student_id", profile.id);

  const classIds = (classStudents ?? []).map((cs) => cs.class_id);
  if (classIds.length === 0) return { data: [], error: null };

  const { data, error } = await supabase
    .from("lesson_assignments")
    .select("*, lessons(title), classes(name)")
    .in("class_id", classIds)
    .order("due_date", { ascending: true });

  if (error) return { data: [], error: error.message };

  // Get progress for each assignment
  const { data: progress } = await supabase
    .from("student_progress")
    .select("lesson_id, class_id, completion_percentage, completed_at")
    .eq("student_id", profile.id)
    .in("class_id", classIds);

  const progressMap: Record<string, { completion_percentage: number; completed_at: string | null }> = {};
  for (const p of progress ?? []) {
    progressMap[`${p.lesson_id}_${p.class_id}`] = { completion_percentage: p.completion_percentage, completed_at: p.completed_at };
  }

  const enriched = (data ?? []).map((a) => ({
    ...a,
    progress: progressMap[`${a.lesson_id}_${a.class_id}`] ?? null,
  }));

  return { data: enriched, error: null };
}

// ============================================================
// Progress Overview
// ============================================================

export async function getStudentProgress() {
  const profile = await getCurrentProfile();
  if (!profile) return { data: [], error: "Not authenticated" };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("student_progress")
    .select("*, lessons(title), classes(name)")
    .eq("student_id", profile.id)
    .order("class_id");

  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

// ============================================================
// Badges
// ============================================================

export async function getStudentBadges() {
  const profile = await getCurrentProfile();
  if (!profile) return { data: [], error: "Not authenticated" };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("student_badges")
    .select("*, badges(name, description, icon_url)")
    .eq("student_id", profile.id)
    .order("earned_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

// ============================================================
// Certificates
// ============================================================

export async function getStudentCertificates() {
  const profile = await getCurrentProfile();
  if (!profile) return { data: [], error: "Not authenticated" };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("certificates")
    .select("*, courses(title)")
    .eq("student_id", profile.id)
    .order("issued_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}
