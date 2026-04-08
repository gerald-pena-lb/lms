"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAssignmentSubmissions } from "@/lib/teacher/actions";
import { SubmissionTable } from "@/components/teacher/submission-table";
import { Button } from "@/components/ui/button";

interface Activity {
  id: string;
  title: string;
  type: string;
  points: number;
}

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

export default function SubmissionsPage({
  params,
}: {
  params: { classId: string; lessonId: string };
}) {
  const [, startTransition] = useTransition();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  function loadData() {
    startTransition(async () => {
      const result = await getAssignmentSubmissions(params.lessonId, params.classId);
      if (result.data) {
        setActivities(result.data.activities as Activity[]);
        setSubmissions(result.data.submissions as Submission[]);
      }
    });
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/teacher/assignments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Submissions</h1>
          <p className="text-muted-foreground">
            Review and grade student submissions.
          </p>
        </div>
      </div>

      <SubmissionTable
        activities={activities}
        submissions={submissions}
        onRefresh={loadData}
      />
    </div>
  );
}
