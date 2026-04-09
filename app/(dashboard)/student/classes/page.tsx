import { getStudentClasses } from "@/lib/student/actions";
import { StudentClassList } from "@/components/student/class-list";

export default async function StudentClassesPage() {
  const result = await getStudentClasses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Classes</h1>
        <p className="text-muted-foreground">
          View your enrolled classes and track progress.
        </p>
      </div>

      <StudentClassList
        classes={result.data as Parameters<typeof StudentClassList>[0]["classes"]}
      />
    </div>
  );
}
