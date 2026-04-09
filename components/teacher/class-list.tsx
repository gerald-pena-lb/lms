"use client";

import Link from "next/link";
import { Users, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClassItem {
  id: string;
  name: string;
  grade_level: string | null;
  academic_year: string;
  student_count: number;
  courses: { title: string } | null;
  schools: { name: string } | null;
}

export function ClassList({ classes }: { classes: ClassItem[] }) {
  if (classes.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No classes assigned yet. Contact your supervisor to get started.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {classes.map((cls) => (
        <Link key={cls.id} href={`/teacher/classes/${cls.id}`}>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{cls.name}</CardTitle>
                {cls.grade_level && (
                  <Badge variant="outline">{cls.grade_level}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>{cls.courses?.title ?? "No course"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{cls.student_count} students</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {cls.academic_year} {cls.schools?.name ? `— ${cls.schools.name}` : ""}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
