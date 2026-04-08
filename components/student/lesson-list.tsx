"use client";

import { FileText, Calendar, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface LessonAssignment {
  id: string;
  lesson_id: string;
  due_date: string | null;
  lessons: { id: string; title: string; description: string | null } | null;
  progress: { completion_percentage: number; completed_at: string | null } | null;
}

export function LessonList({ assignments }: { assignments: LessonAssignment[] }) {
  if (assignments.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No lessons assigned yet for this class.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map((a) => {
        const isComplete = a.progress?.completed_at != null;
        const pct = a.progress?.completion_percentage ?? 0;
        return (
          <Card key={a.id}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{a.lessons?.title ?? "—"}</h3>
                    <div className="flex items-center gap-2">
                      {a.due_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(a.due_date).toLocaleDateString()}
                        </div>
                      )}
                      <Badge variant={isComplete ? "default" : pct > 0 ? "secondary" : "outline"}>
                        {isComplete ? "Complete" : pct > 0 ? `${pct}%` : "Not started"}
                      </Badge>
                    </div>
                  </div>
                  {a.lessons?.description && (
                    <p className="text-sm text-muted-foreground">{a.lessons.description}</p>
                  )}
                  {pct > 0 && !isComplete && (
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
