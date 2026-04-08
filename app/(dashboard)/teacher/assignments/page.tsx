import { getTeacherAssignments } from "@/lib/teacher/actions";
import { AssignmentList } from "@/components/teacher/assignment-list";

export default async function TeacherAssignmentsPage() {
  const result = await getTeacherAssignments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-muted-foreground">
          View lesson assignments and grade student submissions.
        </p>
      </div>

      <AssignmentList
        assignments={result.data as Parameters<typeof AssignmentList>[0]["assignments"]}
      />
    </div>
  );
}
