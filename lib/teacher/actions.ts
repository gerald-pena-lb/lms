"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/actions";
import {
  gradeSubmissionSchema,
  markAttendanceSchema,
  startSessionSchema,
  type GradeSubmissionInput,
  type MarkAttendanceInput,
  type StartSessionInput,
} from "@/lib/validators/teacher";
import type { AttendanceStatus, SubmissionStatus } from "@/types/database";

// ============================================================
// Dashboard Stats
// ============================================================

export async function getTeacherStats() {
  const profile = await getCurrentProfile();
  if (!profile) return { classes: 0, students: 0, pendingSubmissions: 0, attendanceRate: 0 };

  const supabase = await createClient();

  // Get teacher's class IDs
  const { data: classTeachers } = await supabase
    .from("class_teachers")
    .select("class_id")
    .eq("teacher_id", profile.id);

  const classIds = (classTeachers ?? []).map((ct) => ct.class_id);

  if (classIds.length === 0) {
    return { classes: 0, students: 0, pendingSubmissions: 0, attendanceRate: 0 };
  }

  const [students, pendingSubs, totalAttendance, presentAttendance] = await Promise.all([
    supabase.from("class_students").select("*", { count: "exact", head: true }).in("class_id", classIds),
    supabase.from("submissions").select("*", { count: "exact", head: true }).in("class_id", classIds).eq("status", "submitted"),
    supabase.from("attendance").select("*", { count: "exact", head: true }).in("class_id", classIds),
    supabase.from("attendance").select("*", { count: "exact", head: true }).in("class_id", classIds).eq("status", "present"),
  ]);

  const total = totalAttendance.count ?? 0;
  const present = presentAttendance.count ?? 0;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  return {
    classes: classIds.length,
    students: students.count ?? 0,
    pendingSubmissions: pendingSubs.count ?? 0,
    attendanceRate: rate,
  };
}

// ============================================================
// Classes
// ============================================================

export async function getTeacherClasses() {
  const profile = await getCurrentProfile();
  if (!profile) return { data: [], error: "Not authenticated" };

  const supabase = await createClient();

  const { data: classTeachers } = await supabase
    .from("class_teachers")
    .select("class_id")
    .eq("teacher_id", profile.id);

  const classIds = (classTeachers ?? []).map((ct) => ct.class_id);
  if (classIds.length === 0) return { data: [], error: null };

  const { data, error } = await supabase
    .from("classes")
    .select("*, courses(title), schools(name)")
    .in("id", classIds)
    .order("name");

  if (error) return { data: [], error: error.message };

  // Get student counts per class
  const { data: studentCounts } = await supabase
    .from("class_students")
    .select("class_id")
    .in("class_id", classIds);

  const countMap: Record<string, number> = {};
  for (const sc of studentCounts ?? []) {
    countMap[sc.class_id] = (countMap[sc.class_id] ?? 0) + 1;
  }

  const enriched = (data ?? []).map((cls) => ({
    ...cls,
    student_count: countMap[cls.id] ?? 0,
  }));

  return { data: enriched, error: null };
}

export async function getClassDetail(classId: string) {
  const supabase = await createClient();

  const { data: cls, error: clsError } = await supabase
    .from("classes")
    .select("*, courses(title, id), schools(name)")
    .eq("id", classId)
    .single();

  if (clsError) return { data: null, error: clsError.message };

  const [studentsResult, assignmentsResult] = await Promise.all([
    supabase
      .from("class_students")
      .select("student_id, profiles!class_students_student_id_fkey(full_name, email, avatar_url)")
      .eq("class_id", classId),
    supabase
      .from("lesson_assignments")
      .select("*, lessons(title, description)")
      .eq("class_id", classId)
      .order("assigned_at", { ascending: false }),
  ]);

  return {
    data: {
      class: cls,
      students: studentsResult.data ?? [],
      assignments: assignmentsResult.data ?? [],
    },
    error: null,
  };
}

// ============================================================
// Assignments
// ============================================================

export async function getTeacherAssignments() {
  const profile = await getCurrentProfile();
  if (!profile) return { data: [], error: "Not authenticated" };

  const supabase = await createClient();

  const { data: classTeachers } = await supabase
    .from("class_teachers")
    .select("class_id")
    .eq("teacher_id", profile.id);

  const classIds = (classTeachers ?? []).map((ct) => ct.class_id);
  if (classIds.length === 0) return { data: [], error: null };

  const { data, error } = await supabase
    .from("lesson_assignments")
    .select("*, lessons(title), classes(name)")
    .in("class_id", classIds)
    .order("assigned_at", { ascending: false });

  if (error) return { data: [], error: error.message };

  // Get submission counts per assignment (by class_id)
  const { data: submissions } = await supabase
    .from("submissions")
    .select("class_id, status")
    .in("class_id", classIds);

  const subCountMap: Record<string, { total: number; pending: number }> = {};
  for (const sub of submissions ?? []) {
    if (!subCountMap[sub.class_id]) subCountMap[sub.class_id] = { total: 0, pending: 0 };
    subCountMap[sub.class_id].total++;
    if (sub.status === "submitted") subCountMap[sub.class_id].pending++;
  }

  const enriched = (data ?? []).map((a) => ({
    ...a,
    submission_count: subCountMap[a.class_id]?.total ?? 0,
    pending_count: subCountMap[a.class_id]?.pending ?? 0,
  }));

  return { data: enriched, error: null };
}

export async function getAssignmentSubmissions(lessonId: string, classId: string) {
  const supabase = await createClient();

  // Get activities for this lesson
  const { data: activities } = await supabase
    .from("activities")
    .select("id, title, type, points")
    .eq("lesson_id", lessonId);

  const activityIds = (activities ?? []).map((a) => a.id);
  if (activityIds.length === 0) return { data: { activities: activities ?? [], submissions: [] }, error: null };

  const { data: submissions, error } = await supabase
    .from("submissions")
    .select("*, profiles!submissions_student_id_fkey(full_name, email)")
    .in("activity_id", activityIds)
    .eq("class_id", classId)
    .order("submitted_at", { ascending: false });

  if (error) return { data: { activities: activities ?? [], submissions: [] }, error: error.message };

  return { data: { activities: activities ?? [], submissions: submissions ?? [] }, error: null };
}

export async function gradeSubmission(id: string, data: GradeSubmissionInput) {
  const parsed = gradeSubmissionSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("submissions")
    .update({
      score: parsed.data.score,
      max_score: parsed.data.max_score,
      feedback: parsed.data.feedback || null,
      status: "graded" as SubmissionStatus,
      graded_by: profile.id,
      graded_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/teacher/assignments");
  return { error: null };
}

// ============================================================
// Attendance
// ============================================================

export async function getClassAttendance(classId: string, date?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("attendance")
    .select("*, profiles!attendance_student_id_fkey(full_name)")
    .eq("class_id", classId)
    .order("date", { ascending: false });

  if (date) {
    query = query.eq("date", date);
  }

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

export async function getClassStudents(classId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("class_students")
    .select("student_id, profiles!class_students_student_id_fkey(full_name, email)")
    .eq("class_id", classId);

  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

export async function markAttendance(data: MarkAttendanceInput) {
  const parsed = markAttendanceSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const supabase = await createClient();

  const records = parsed.data.records.map((r) => ({
    class_id: parsed.data.class_id,
    lesson_id: parsed.data.lesson_id,
    date: parsed.data.date,
    student_id: r.student_id,
    status: r.status as AttendanceStatus,
    marked_by: profile.id,
  }));

  const { error } = await supabase.from("attendance").upsert(records, {
    onConflict: "class_id,student_id,lesson_id,date",
    ignoreDuplicates: false,
  });

  if (error) return { error: error.message };

  revalidatePath("/teacher/attendance");
  return { error: null };
}

// ============================================================
// Student Progress
// ============================================================

export async function getStudentProgressByClass(classId: string) {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("class_students")
    .select("student_id, profiles!class_students_student_id_fkey(full_name, email)")
    .eq("class_id", classId);

  const studentIds = (students ?? []).map((s) => s.student_id);
  if (studentIds.length === 0) return { data: { students: [], progress: [] }, error: null };

  const { data: progress } = await supabase
    .from("student_progress")
    .select("*, lessons(title)")
    .eq("class_id", classId)
    .in("student_id", studentIds);

  return {
    data: {
      students: students ?? [],
      progress: progress ?? [],
    },
    error: null,
  };
}

// ============================================================
// Teaching Sessions
// ============================================================

export async function getActiveSession() {
  const profile = await getCurrentProfile();
  if (!profile) return { data: null, error: "Not authenticated" };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teaching_sessions")
    .select("*, lessons(title), classes(name)")
    .eq("teacher_id", profile.id)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function startTeachingSession(data: StartSessionInput) {
  const parsed = startSessionSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not authenticated" };

  const supabase = await createClient();

  // End any existing active session
  await supabase
    .from("teaching_sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("teacher_id", profile.id)
    .is("ended_at", null);

  const { error } = await supabase.from("teaching_sessions").insert({
    teacher_id: profile.id,
    class_id: parsed.data.class_id,
    lesson_id: parsed.data.lesson_id,
  });

  if (error) return { error: error.message };

  revalidatePath("/teacher/teaching-mode");
  return { error: null };
}

export async function endTeachingSession(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("teaching_sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/teacher/teaching-mode");
  return { error: null };
}

// ============================================================
// Lessons for a class (for dropdowns)
// ============================================================

export async function getClassLessons(classId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lesson_assignments")
    .select("lesson_id, lessons(id, title)")
    .eq("class_id", classId);

  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}
