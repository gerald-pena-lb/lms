import Link from "next/link";
import { Users, BookOpen, ClipboardList, BarChart3 } from "lucide-react";
import { getTeacherStats } from "@/lib/teacher/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function TeacherDashboard() {
  const stats = await getTeacherStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here is your class overview.</p>
        </div>
        <Button asChild>
          <Link href="/teacher/teaching-mode">Start Teaching Mode</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>My Classes</CardDescription>
            <CardTitle className="text-4xl">{stats.classes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Assigned classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Students</CardDescription>
            <CardTitle className="text-4xl">{stats.students}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across all classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Reviews</CardDescription>
            <CardTitle className="text-4xl">{stats.pendingSubmissions}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Submissions to grade</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Attendance Rate</CardDescription>
            <CardTitle className="text-4xl">{stats.attendanceRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Overall attendance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/teacher/classes">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <CardTitle>My Classes</CardTitle>
              </div>
              <CardDescription>
                View students, lessons, and manage your assigned classes.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/teacher/assignments">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                <CardTitle>Assignments</CardTitle>
              </div>
              <CardDescription>
                Review and grade student submissions.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/teacher/attendance">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Attendance</CardTitle>
              </div>
              <CardDescription>
                Mark and track student attendance.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/teacher/progress">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <CardTitle>Student Progress</CardTitle>
              </div>
              <CardDescription>
                Track lesson completion across your classes.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
