import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getClassDetail } from "@/lib/teacher/actions";
import { ClassDetail } from "@/components/teacher/class-detail";
import { Button } from "@/components/ui/button";

export default async function ClassDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getClassDetail(params.id);

  if (!result.data || result.error) {
    notFound();
  }

  const { class: classInfo, students, assignments } = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/teacher/classes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{classInfo.name}</h1>
          <p className="text-muted-foreground">
            {classInfo.academic_year}
            {classInfo.grade_level && ` — ${classInfo.grade_level}`}
            {classInfo.schools?.name && ` — ${classInfo.schools.name}`}
          </p>
        </div>
      </div>

      <ClassDetail
        classInfo={classInfo as Parameters<typeof ClassDetail>[0]["classInfo"]}
        students={students as Parameters<typeof ClassDetail>[0]["students"]}
        assignments={assignments as Parameters<typeof ClassDetail>[0]["assignments"]}
      />
    </div>
  );
}
