import { getCourses } from "@/lib/supervisor/actions";
import { getSchools } from "@/lib/admin/actions";
import { CourseTable } from "@/components/supervisor/course-table";

export default async function CoursesPage() {
  const [coursesResult, schoolsResult] = await Promise.all([
    getCourses(),
    getSchools(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Courses</h1>
        <p className="text-muted-foreground">
          Manage courses, modules, lessons, and activities.
        </p>
      </div>

      <CourseTable
        initialCourses={coursesResult.data as Parameters<typeof CourseTable>[0]["initialCourses"]}
        schools={schoolsResult.data.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
