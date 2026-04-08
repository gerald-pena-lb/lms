"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Pencil, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getCourses, deleteCourse } from "@/lib/supervisor/actions";
import { CourseForm } from "@/components/supervisor/course-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

interface Course {
  id: string;
  title: string;
  description: string | null;
  level: string | null;
  status: string;
  school_id: string | null;
  created_at: string;
  schools: { name: string } | null;
  profiles: { full_name: string } | null;
}

interface School {
  id: string;
  name: string;
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
  archived: "outline",
};

export function CourseTable({ initialCourses, schools }: { initialCourses: Course[]; schools: School[] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);

  function refresh() {
    startTransition(async () => {
      const result = await getCourses();
      if (!result.error) setCourses(result.data as Course[]);
    });
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete course "${title}"? This will also delete all modules, lessons, and activities.`)) return;
    startTransition(async () => {
      const result = await deleteCourse(id);
      if (result.error) toast.error(result.error);
      else { toast.success("Course deleted"); refresh(); }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Create Course</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>Add a new course to the curriculum.</DialogDescription>
            </DialogHeader>
            <CourseForm mode="create" schools={schools} onSuccess={() => { setCreateOpen(false); refresh(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No courses yet. Create your first course to get started.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell className="text-muted-foreground">{course.level ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{course.schools?.name ?? "Global"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[course.status] ?? "outline"} className="capitalize">
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{course.profiles?.full_name ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/supervisor/courses/${course.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Dialog open={editCourse?.id === course.id} onOpenChange={(o) => setEditCourse(o ? course : null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Course</DialogTitle>
                            <DialogDescription>Update course details.</DialogDescription>
                          </DialogHeader>
                          <CourseForm mode="edit" course={course} schools={schools} onSuccess={() => { setEditCourse(null); refresh(); }} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(course.id, course.title)} disabled={isPending}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
