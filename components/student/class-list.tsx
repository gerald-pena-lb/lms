"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClassItem {
  id: string;
  name: string;
  grade_level: string | null;
  academic_year: string;
  completion: number;
  courses: { title: string } | null;
  schools: { name: string } | null;
}

export function StudentClassList({ classes }: { classes: ClassItem[] }) {
  if (classes.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        You are not enrolled in any classes yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {classes.map((cls) => (
        <Link key={cls.id} href={`/student/classes/${cls.id}`}>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{cls.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>{cls.courses?.title ?? "No course"}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{cls.completion}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${cls.completion}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {cls.academic_year}
                {cls.schools?.name ? ` — ${cls.schools.name}` : ""}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
