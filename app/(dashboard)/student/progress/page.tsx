import { getStudentProgress } from "@/lib/student/actions";
import { ProgressView } from "@/components/student/progress-view";

export default async function StudentProgressPage() {
  const result = await getStudentProgress();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Progress</h1>
        <p className="text-muted-foreground">
          Track your completion across all classes and lessons.
        </p>
      </div>

      <ProgressView
        progress={result.data as Parameters<typeof ProgressView>[0]["progress"]}
      />
    </div>
  );
}
