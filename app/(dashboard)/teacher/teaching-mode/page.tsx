import { getTeacherClasses, getActiveSession } from "@/lib/teacher/actions";
import { TeachingSession } from "@/components/teacher/teaching-session";

export default async function TeachingModePage() {
  const [classesResult, sessionResult] = await Promise.all([
    getTeacherClasses(),
    getActiveSession(),
  ]);

  const classes = (classesResult.data ?? []).map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teaching Mode</h1>
        <p className="text-muted-foreground">
          Start a live teaching session for your class.
        </p>
      </div>

      <TeachingSession
        classes={classes}
        initialSession={sessionResult.data as Parameters<typeof TeachingSession>[0]["initialSession"]}
      />
    </div>
  );
}
