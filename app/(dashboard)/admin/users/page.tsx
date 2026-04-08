import { getUsers, getSchools } from "@/lib/admin/actions";
import { UserTable } from "@/components/admin/user-table";

export default async function UsersPage() {
  const [usersResult, schoolsResult] = await Promise.all([
    getUsers(),
    getSchools(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage all users across the platform.
        </p>
      </div>

      <UserTable
        initialUsers={usersResult.data as Parameters<typeof UserTable>[0]["initialUsers"]}
        schools={schoolsResult.data.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
