import { getSchools } from "@/lib/admin/actions";
import { SchoolTable } from "@/components/admin/school-table";

export default async function SchoolsPage() {
  const result = await getSchools();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">School Management</h1>
        <p className="text-muted-foreground">
          Manage partner schools on the platform.
        </p>
      </div>

      <SchoolTable
        initialSchools={result.data as Parameters<typeof SchoolTable>[0]["initialSchools"]}
      />
    </div>
  );
}
