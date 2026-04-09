"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { gradeSubmission } from "@/lib/teacher/actions";
import { gradeSubmissionSchema, type GradeSubmissionInput } from "@/lib/validators/teacher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface GradeFormProps {
  submissionId: string;
  maxPoints: number;
  onSuccess: () => void;
}

export function GradeForm({ submissionId, maxPoints, onSuccess }: GradeFormProps) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<GradeSubmissionInput>({
    resolver: zodResolver(gradeSubmissionSchema),
    defaultValues: { score: 0, max_score: maxPoints, feedback: "" },
  });

  function onSubmit(data: GradeSubmissionInput) {
    startTransition(async () => {
      const result = await gradeSubmission(submissionId, data);
      if (result.error) toast.error(result.error);
      else { toast.success("Submission graded"); onSuccess(); }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="score">Score</Label>
          <Input id="score" type="number" min="0" {...register("score", { valueAsNumber: true })} />
          {errors.score && <p className="text-sm text-destructive">{errors.score.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_score">Max Score</Label>
          <Input id="max_score" type="number" min="1" {...register("max_score", { valueAsNumber: true })} />
          {errors.max_score && <p className="text-sm text-destructive">{errors.max_score.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="feedback">Feedback</Label>
        <Textarea id="feedback" placeholder="Optional feedback for the student..." {...register("feedback")} />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Grading..." : "Submit Grade"}
      </Button>
    </form>
  );
}
