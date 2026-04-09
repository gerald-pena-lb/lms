import { z } from "zod";

export const submitActivitySchema = z.object({
  activity_id: z.string().uuid(),
  class_id: z.string().uuid(),
  response_json: z.any().optional(),
  file_url: z.string().optional().or(z.literal("")),
});

export type SubmitActivityInput = z.infer<typeof submitActivitySchema>;
