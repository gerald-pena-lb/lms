import { z } from "zod";

export const gradeSubmissionSchema = z.object({
  score: z.number().min(0, "Score must be at least 0"),
  max_score: z.number().min(1, "Max score must be at least 1"),
  feedback: z.string().optional().or(z.literal("")),
});

export const markAttendanceSchema = z.object({
  class_id: z.string().uuid(),
  lesson_id: z.string().uuid(),
  date: z.string().min(1, "Date is required"),
  records: z.array(
    z.object({
      student_id: z.string().uuid(),
      status: z.enum(["present", "absent", "late", "excused"]),
    })
  ),
});

export const startSessionSchema = z.object({
  class_id: z.string().uuid(),
  lesson_id: z.string().uuid(),
});

export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
export type StartSessionInput = z.infer<typeof startSessionSchema>;
