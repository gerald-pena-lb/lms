import { getTeacherClasses } from "@/lib/teacher/actions";
import { ClassList } from "@/components/teacher/class-list";

export default async function TeacherClassesPage() {
  const result = await getTeacherClasses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Classes</h1>
        <p className="text-muted-foreground">
          View and manage your assigned classes.
        </p>
      </div>

      <ClassList classes={result.data as Parameters<typeof ClassList>[0]["classes"]} />
    </div>
  );
}
