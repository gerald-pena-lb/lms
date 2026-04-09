"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Assignment {
  id: string;
  lesson_id: string;
  class_id: string;
  due_date: string | null;
  assigned_at: string;
  submission_count: number;
  pending_count: number;
  lessons: { title: string } | null;
  classes: { name: string } | null;
}

export function AssignmentList({ assignments }: { assignments: Assignment[] }) {
  if (assignments.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No assignments found across your classes.
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
            <TableHead>Submissions</TableHead>
            <TableHead>Pending</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.lessons?.title ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{a.classes?.name ?? "—"}</TableCell>
              <TableCell>
                {a.due_date ? (
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(a.due_date).toLocaleDateString()}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{a.submission_count}</Badge>
              </TableCell>
              <TableCell>
                {a.pending_count > 0 ? (
                  <Badge variant="secondary">{a.pending_count} to grade</Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">0</span>
                )}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/teacher/assignments/${a.class_id}/${a.lesson_id}`}>
                    Review
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
