import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCourseWithDetails } from "@/lib/supervisor/actions";
import { CourseBuilder } from "@/components/supervisor/course-builder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
  archived: "outline",
};

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getCourseWithDetails(params.id);

  if (!result.data || result.error) {
    notFound();
  }

  const { course, modules, lessons, activities } = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/supervisor/courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <Badge
              variant={statusVariant[course.status] ?? "outline"}
              className="capitalize"
            >
              {course.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {course.description || "No description"}
            {course.level && ` — ${course.level}`}
            {course.schools?.name && ` — ${course.schools.name}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold">{modules.length}</p>
          <p className="text-sm text-muted-foreground">Modules</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold">{lessons.length}</p>
          <p className="text-sm text-muted-foreground">Lessons</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold">{activities.length}</p>
          <p className="text-sm text-muted-foreground">Activities</p>
        </div>
      </div>

      <CourseBuilder
        courseId={course.id}
        modules={modules}
        lessons={lessons}
        activities={activities}
      />
    </div>
  );
}
