import { getTeacherClasses } from "@/lib/teacher/actions";
import { ProgressOverview } from "@/components/teacher/progress-overview";

export default async function ProgressPage() {
  const result = await getTeacherClasses();
  const classes = (result.data ?? []).map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Progress</h1>
        <p className="text-muted-foreground">
          Track student completion across lessons.
        </p>
      </div>

      <ProgressOverview classes={classes} />
    </div>
  );
}
