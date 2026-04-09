"use client";

import { Calendar, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Assignment {
  id: string;
  lesson_id: string;
  class_id: string;
  due_date: string | null;
  assigned_at: string;
  lessons: { title: string } | null;
  classes: { name: string } | null;
  progress: { completion_percentage: number; completed_at: string | null } | null;
}

export function StudentAssignmentList({ assignments }: { assignments: Assignment[] }) {
  if (assignments.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No assignments yet.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lesson</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((a) => {
            const isComplete = a.progress?.completed_at != null;
            const pct = a.progress?.completion_percentage ?? 0;
            const isOverdue = a.due_date && !isComplete && new Date(a.due_date) < new Date();
            return (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.lessons?.title ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{a.classes?.name ?? "—"}</TableCell>
                <TableCell>
                  {a.due_date ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className={isOverdue ? "text-destructive" : ""}>
                        {new Date(a.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {isComplete ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Complete
                    </Badge>
                  ) : isOverdue ? (
                    <Badge variant="destructive">Overdue</Badge>
                  ) : pct > 0 ? (
                    <Badge variant="secondary">In Progress</Badge>
                  ) : (
                    <Badge variant="outline">Not Started</Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
