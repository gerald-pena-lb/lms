import { getStudentAssignments } from "@/lib/student/actions";
import { StudentAssignmentList } from "@/components/student/assignment-list";

export default async function StudentAssignmentsPage() {
  const result = await getStudentAssignments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-muted-foreground">
          View your assigned lessons and due dates.
        </p>
      </div>

      <StudentAssignmentList
        assignments={result.data as Parameters<typeof StudentAssignmentList>[0]["assignments"]}
      />
    </div>
  );
}
