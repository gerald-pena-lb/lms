"use client";

import Link from "next/link";
import { Users, FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Student {
  student_id: string;
  profiles: { full_name: string; email: string; avatar_url: string | null } | null;
}

interface Assignment {
  id: string;
  lesson_id: string;
  class_id: string;
  due_date: string | null;
  assigned_at: string;
  lessons: { title: string; description: string | null } | null;
}

interface ClassInfo {
  id: string;
  name: string;
  grade_level: string | null;
  academic_year: string;
  courses: { title: string; id: string } | null;
  schools: { name: string } | null;
}

interface ClassDetailProps {
  classInfo: ClassInfo;
  students: Student[];
  assignments: Assignment[];
}

export function ClassDetail({ classInfo, students, assignments }: ClassDetailProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{students.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Lessons Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{assignments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Course</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{classInfo.courses?.title ?? "—"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Students */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>Enrolled Students</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-muted-foreground text-sm">No students enrolled.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.student_id}>
                      <TableCell className="font-medium">{s.profiles?.full_name ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{s.profiles?.email ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Lessons */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Assigned Lessons</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No lessons assigned yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lesson</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.lessons?.title ?? "—"}</TableCell>
                      <TableCell>
                        {a.due_date ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(a.due_date).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No due date</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(a.assigned_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/teacher/assignments/${a.class_id}/${a.lesson_id}`}>
                            View Submissions
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
