"use client";

import { useState, useTransition } from "react";
import { getStudentProgressByClass } from "@/lib/teacher/actions";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface ClassItem {
  id: string;
  name: string;
}

interface Student {
  student_id: string;
  profiles: { full_name: string; email: string } | null;
}

interface Progress {
  id: string;
  student_id: string;
  lesson_id: string;
  completion_percentage: number;
  completed_at: string | null;
  lessons: { title: string } | null;
}

export function ProgressOverview({ classes }: { classes: ClassItem[] }) {
  const [, startTransition] = useTransition();
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);

  function handleClassChange(classId: string) {
    setSelectedClass(classId);
    startTransition(async () => {
      const result = await getStudentProgressByClass(classId);
      if (result.data) {
        setStudents(result.data.students as Student[]);
        setProgress(result.data.progress as Progress[]);
      }
    });
  }

  // Get unique lessons from progress
  const lessonMap = new Map<string, string>();
  for (const p of progress) {
    if (!lessonMap.has(p.lesson_id)) {
      lessonMap.set(p.lesson_id, p.lessons?.title ?? "—");
    }
  }
  const lessonIds = Array.from(lessonMap.keys());

  // Build student → lesson → percentage map
  const progressMap: Record<string, Record<string, number>> = {};
  for (const p of progress) {
    if (!progressMap[p.student_id]) progressMap[p.student_id] = {};
    progressMap[p.student_id][p.lesson_id] = p.completion_percentage;
  }

  return (
    <div className="space-y-6">
      <div className="max-w-sm space-y-2">
        <Label>Class</Label>
        <Select value={selectedClass} onValueChange={handleClassChange}>
          <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
          <SelectContent>
            {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {students.length > 0 && (
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background">Student</TableHead>
                {lessonIds.map((lid) => (
                  <TableHead key={lid} className="text-center min-w-[100px]">
                    {lessonMap.get(lid)}
                  </TableHead>
                ))}
                <TableHead className="text-center">Average</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => {
                const studentProgress = progressMap[s.student_id] ?? {};
                const values = Object.values(studentProgress);
                const avg = values.length > 0
                  ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
                  : 0;
                return (
                  <TableRow key={s.student_id}>
                    <TableCell className="font-medium sticky left-0 bg-background">
                      {s.profiles?.full_name ?? "—"}
                    </TableCell>
                    {lessonIds.map((lid) => {
                      const pct = studentProgress[lid];
                      return (
                        <TableCell key={lid} className="text-center">
                          {pct !== undefined ? (
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">{pct}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center font-semibold">{avg}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedClass && students.length === 0 && (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          No students enrolled in this class.
        </div>
      )}
    </div>
  );
}
