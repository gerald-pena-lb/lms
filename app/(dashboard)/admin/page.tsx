import Link from "next/link";
import { Users, School, BookOpen, UserPlus } from "lucide-react";
import { getDashboardStats } from "@/lib/admin/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and user management.</p>
        </div>
        <Button asChild>
          <Link href="/admin/users">
            <UserPlus className="mr-2 h-4 w-4" />
            Manage Users
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-4xl">{stats.students}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across all schools</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Teachers</CardDescription>
            <CardTitle className="text-4xl">{stats.teachers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Active accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Schools</CardDescription>
            <CardTitle className="text-4xl">{stats.schools}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Partner schools</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Courses</CardDescription>
            <CardTitle className="text-4xl">{stats.courses}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total courses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/users">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>User Management</CardTitle>
              </div>
              <CardDescription>
                Add, edit, and manage users across all roles and schools.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/schools">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2">
                <School className="h-5 w-5" />
                <CardTitle>School Management</CardTitle>
              </div>
              <CardDescription>
                Manage partner schools, codes, and settings.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/courses">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <CardTitle>Courses</CardTitle>
              </div>
              <CardDescription>
                View and manage all courses on the platform.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
