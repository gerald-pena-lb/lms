"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { markAttendance, getClassAttendance, getClassStudents, getClassLessons } from "@/lib/teacher/actions";
import type { MarkAttendanceInput } from "@/lib/validators/teacher";
import type { AttendanceStatus } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

interface AttendanceRecord {
  id: string;
  student_id: string;
  status: AttendanceStatus;
  date: string;
  profiles: { full_name: string } | null;
}

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  present: "default",
  late: "secondary",
  excused: "outline",
  absent: "destructive",
};

export function AttendanceMarker({ classes }: { classes: ClassItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [lessons, setLessons] = useState<Array<{ lesson_id: string; lessons: { id: string; title: string } | null }>>([]);
  const [students, setStudents] = useState<Array<{ student_id: string; profiles: { full_name: string; email: string } | null }>>([]);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [history, setHistory] = useState<AttendanceRecord[]>([]);

  function handleClassChange(classId: string) {
    setSelectedClass(classId);
    setSelectedLesson("");
    setStudents([]);
    setStatuses({});
    startTransition(async () => {
      const [lessonsResult, studentsResult, attendanceResult] = await Promise.all([
        getClassLessons(classId),
        getClassStudents(classId),
        getClassAttendance(classId),
      ]);
      setLessons(lessonsResult.data as typeof lessons);
      setStudents(studentsResult.data as typeof students);
      setHistory(attendanceResult.data as AttendanceRecord[]);
      // Default all students to present
      const defaults: Record<string, AttendanceStatus> = {};
      for (const s of studentsResult.data ?? []) {
        defaults[s.student_id] = "present";
      }
      setStatuses(defaults);
    });
  }

  function handleSubmit() {
    if (!selectedClass || !selectedLesson || !date) {
      toast.error("Please select a class, lesson, and date");
      return;
    }
    const records = Object.entries(statuses).map(([student_id, status]) => ({
      student_id,
      status,
    }));
    const data: MarkAttendanceInput = {
      class_id: selectedClass,
      lesson_id: selectedLesson,
      date,
      records,
    };
    startTransition(async () => {
      const result = await markAttendance(data);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Attendance recorded");
        const updated = await getClassAttendance(selectedClass);
        setHistory(updated.data as AttendanceRecord[]);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Class</Label>
          <Select value={selectedClass} onValueChange={handleClassChange}>
            <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
            <SelectContent>
              {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Lesson</Label>
          <Select value={selectedLesson} onValueChange={setSelectedLesson} disabled={!selectedClass}>
            <SelectTrigger><SelectValue placeholder="Select a lesson" /></SelectTrigger>
            <SelectContent>
              {lessons.map((l) => (
                <SelectItem key={l.lesson_id} value={l.lesson_id}>
                  {l.lessons?.title ?? "—"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {students.length > 0 && selectedLesson && (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.student_id}>
                    <TableCell className="font-medium">{s.profiles?.full_name ?? "—"}</TableCell>
                    <TableCell>
                      <Select
                        value={statuses[s.student_id] ?? "present"}
                        onValueChange={(v) => setStatuses((prev) => ({ ...prev, [s.student_id]: v as AttendanceStatus }))}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="excused">Excused</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving..." : "Save Attendance"}
          </Button>
        </>
      )}

      {history.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Recent Attendance</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.slice(0, 20).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.profiles?.full_name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{r.date}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[r.status] ?? "outline"} className="capitalize">
                        {r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
