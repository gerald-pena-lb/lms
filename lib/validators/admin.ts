import { z } from "zod";

export const createUserSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["student", "teacher", "supervisor", "admin"]),
  school_id: z.string().uuid().optional().or(z.literal("")),
});

export const updateUserSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["student", "teacher", "supervisor", "admin"]),
  school_id: z.string().uuid().optional().or(z.literal("")),
  is_active: z.boolean(),
});

export const createSchoolSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  code: z.string().min(2, "Code must be at least 2 characters").max(20),
  address: z.string().optional().or(z.literal("")),
});

export const updateSchoolSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  code: z.string().min(2, "Code must be at least 2 characters").max(20),
  address: z.string().optional().or(z.literal("")),
  is_active: z.boolean(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;
