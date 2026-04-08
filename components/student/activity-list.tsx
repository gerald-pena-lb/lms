"use client";

import { useState } from "react";
import { Gamepad2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActivitySubmitDialog } from "@/components/student/activity-submit";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const typeLabels: Record<string, string> = {
  quiz: "Quiz", drag_and_drop: "Drag & Drop", matching: "Matching",
  flashcards: "Flashcards", poll: "Poll", game_challenge: "Game Challenge",
  assignment_upload: "Upload", interactive_video: "Video",
  fill_in_blank: "Fill in Blank", story_sequencing: "Story",
  image_recognition: "Image", audio_recognition: "Audio",
  video_response: "Video Response", discussion_prompt: "Discussion",
};

interface ActivityItem {
  id: string;
  title: string;
  type: string;
  points: number;
  lesson_id: string;
  lessons: { title: string } | null;
  submission: { status: string; score: number | null; max_score: number | null } | null;
  class_info: { class_id: string; class_name: string } | null;
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  graded: "default",
  submitted: "secondary",
  returned: "outline",
};

export function ActivityList({ activities, onRefresh }: { activities: ActivityItem[]; onRefresh: () => void }) {
  const [submitActivity, setSubmitActivity] = useState<ActivityItem | null>(null);

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No activities available yet. Check back after your teacher assigns lessons.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Lesson</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((act) => (
              <TableRow key={act.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                    {act.title}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{act.lessons?.title ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{act.class_info?.class_name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {typeLabels[act.type] ?? act.type}
                  </Badge>
                </TableCell>
                <TableCell>{act.points} pts</TableCell>
                <TableCell>
                  {act.submission ? (
                    <Badge variant={statusVariant[act.submission.status] ?? "outline"} className="capitalize">
                      {act.submission.status}
                      {act.submission.score !== null && ` (${act.submission.score}/${act.submission.max_score})`}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not submitted</span>
                  )}
                </TableCell>
                <TableCell>
                  {!act.submission && act.class_info && (
                    <Button variant="ghost" size="sm" onClick={() => setSubmitActivity(act)}>
                      Submit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {submitActivity && submitActivity.class_info && (
        <ActivitySubmitDialog
          activityId={submitActivity.id}
          activityTitle={submitActivity.title}
          classId={submitActivity.class_info.class_id}
          open={!!submitActivity}
          onOpenChange={(o) => { if (!o) setSubmitActivity(null); }}
          onSuccess={() => { setSubmitActivity(null); onRefresh(); }}
        />
      )}
    </>
  );
}
