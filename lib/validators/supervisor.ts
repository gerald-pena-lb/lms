import { z } from "zod";

// Courses
export const createCourseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  description: z.string().optional().or(z.literal("")),
  level: z.string().optional().or(z.literal("")),
  school_id: z.string().uuid().optional().or(z.literal("")),
});

export const updateCourseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  description: z.string().optional().or(z.literal("")),
  level: z.string().optional().or(z.literal("")),
  school_id: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
});

// Modules
export const createModuleSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  description: z.string().optional().or(z.literal("")),
});

export const updateModuleSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  description: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
});

// Lessons
export const createLessonSchema = z.object({
  module_id: z.string().uuid(),
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  description: z.string().optional().or(z.literal("")),
  teacher_notes: z.string().optional().or(z.literal("")),
  timing_guide: z.string().optional().or(z.literal("")),
});

export const updateLessonSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  description: z.string().optional().or(z.literal("")),
  teacher_notes: z.string().optional().or(z.literal("")),
  timing_guide: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
});

// Activities
export const createActivitySchema = z.object({
  lesson_id: z.string().uuid(),
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  type: z.enum([
    "quiz", "drag_and_drop", "matching", "flashcards", "poll",
    "game_challenge", "assignment_upload", "interactive_video",
    "fill_in_blank", "story_sequencing", "image_recognition",
    "audio_recognition", "video_response", "discussion_prompt",
  ]),
  points: z.coerce.number().int().min(0).default(0),
  time_limit_seconds: z.coerce.number().int().min(0).optional().or(z.literal("")),
});

export const updateActivitySchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  type: z.enum([
    "quiz", "drag_and_drop", "matching", "flashcards", "poll",
    "game_challenge", "assignment_upload", "interactive_video",
    "fill_in_blank", "story_sequencing", "image_recognition",
    "audio_recognition", "video_response", "discussion_prompt",
  ]),
  points: z.coerce.number().int().min(0).default(0),
  time_limit_seconds: z.coerce.number().int().min(0).optional().or(z.literal("")),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
