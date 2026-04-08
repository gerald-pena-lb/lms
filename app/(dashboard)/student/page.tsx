import Link from "next/link";
import { BookOpen, Trophy, BarChart3, Award } from "lucide-react";
import { getStudentStats, getStudentBadges } from "@/lib/student/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StudentDashboard() {
  const [stats, badgesResult] = await Promise.all([
    getStudentStats(),
    getStudentBadges(),
  ]);

  const recentBadges = (badgesResult.data ?? []).slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, Student!</h1>
        <p className="text-muted-foreground">Here is your learning progress overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>My Classes</CardDescription>
            <CardTitle className="text-4xl">{stats.classes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Enrolled classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completion</CardDescription>
            <CardTitle className="text-4xl">{stats.completionPct}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${stats.completionPct}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Score</CardDescription>
            <CardTitle className="text-4xl">{stats.totalScore}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Points earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Badges</CardDescription>
            <CardTitle className="text-4xl">{stats.badges}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Achievements earned</p>
          </CardContent>
        </Card>
      </div>

      {recentBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {recentBadges.map((b: { id: string; earned_at: string; badges: { name: string; description: string } | null }) => (
                <div key={b.id} className="flex items-center gap-2">
                  <Award className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">{b.badges?.name}</p>
                    <p className="text-xs text-muted-foreground">{b.badges?.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/student/classes">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <CardTitle>My Classes</CardTitle>
              </div>
              <CardDescription>View your enrolled classes and lessons.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/student/activities">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                <CardTitle>Activities</CardTitle>
              </div>
              <CardDescription>Complete activities and earn points.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/student/progress">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <CardTitle>Progress</CardTitle>
              </div>
              <CardDescription>Track your learning progress.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
