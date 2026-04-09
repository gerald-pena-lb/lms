import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getClassLessons } from "@/lib/student/actions";
import { LessonList } from "@/components/student/lesson-list";
import { Button } from "@/components/ui/button";

export default async function StudentClassDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getClassLessons(params.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/student/classes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Class Lessons</h1>
          <p className="text-muted-foreground">
            View assigned lessons and track your completion.
          </p>
        </div>
      </div>

      <LessonList
        assignments={result.data as Parameters<typeof LessonList>[0]["assignments"]}
      />
    </div>
  );
}
