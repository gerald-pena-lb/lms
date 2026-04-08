import { getTeacherClasses } from "@/lib/teacher/actions";
import { AttendanceMarker } from "@/components/teacher/attendance-marker";

export default async function AttendancePage() {
  const result = await getTeacherClasses();
  const classes = (result.data ?? []).map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance</h1>
        <p className="text-muted-foreground">
          Mark and view attendance for your classes.
        </p>
      </div>

      <AttendanceMarker classes={classes} />
    </div>
  );
}
