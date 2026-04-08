"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GradeForm } from "@/components/teacher/grade-form";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

interface Submission {
  id: string;
  activity_id: string;
  status: string;
  score: number | null;
  max_score: number | null;
  feedback: string | null;
  submitted_at: string;
  graded_at: string | null;
  profiles: { full_name: string; email: string } | null;
}

interface Activity {
  id: string;
  title: string;
  type: string;
  points: number;
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  graded: "default",
  submitted: "secondary",
  returned: "outline",
  pending: "outline",
};

export function SubmissionTable({
  submissions,
  activities,
  onRefresh,
}: {
  submissions: Submission[];
  activities: Activity[];
  onRefresh: () => void;
}) {
  const [grading, setGrading] = useState<Submission | null>(null);

  const activityMap: Record<string, Activity> = {};
  for (const a of activities) activityMap[a.id] = a;

  if (submissions.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No submissions yet for this assignment.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.profiles?.full_name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {activityMap[sub.activity_id]?.title ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[sub.status] ?? "outline"} className="capitalize">
                    {sub.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {sub.score !== null ? `${sub.score}/${sub.max_score}` : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(sub.submitted_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {sub.status === "submitted" && (
                    <Button variant="ghost" size="sm" onClick={() => setGrading(sub)}>
                      Grade
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!grading} onOpenChange={(o) => !o && setGrading(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              Grade {grading?.profiles?.full_name}&apos;s submission for{" "}
              {grading ? activityMap[grading.activity_id]?.title : ""}.
            </DialogDescription>
          </DialogHeader>
          {grading && (
            <GradeForm
              submissionId={grading.id}
              maxPoints={activityMap[grading.activity_id]?.points ?? 100}
              onSuccess={() => { setGrading(null); onRefresh(); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
