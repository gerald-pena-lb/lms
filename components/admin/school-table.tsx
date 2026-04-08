"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil } from "lucide-react";
import { getSchools } from "@/lib/admin/actions";
import { SchoolForm } from "@/components/admin/school-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface School {
  id: string;
  name: string;
  code: string;
  logo_url: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SchoolTableProps {
  initialSchools: School[];
}

export function SchoolTable({ initialSchools }: SchoolTableProps) {
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [, startTransition] = useTransition();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editSchool, setEditSchool] = useState<School | null>(null);

  function refreshSchools() {
    startTransition(async () => {
      const result = await getSchools();
      if (!result.error) {
        setSchools(result.data as School[]);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add School
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New School</DialogTitle>
              <DialogDescription>
                Add a new partner school to the platform.
              </DialogDescription>
            </DialogHeader>
            <SchoolForm
              mode="create"
              onSuccess={() => {
                setCreateDialogOpen(false);
                refreshSchools();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No schools found. Add your first school to get started.
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{school.code}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {school.address || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={school.is_active ? "default" : "secondary"}>
                      {school.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog
                      open={editSchool?.id === school.id}
                      onOpenChange={(open) => setEditSchool(open ? school : null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit School</DialogTitle>
                          <DialogDescription>
                            Update details for {school.name}.
                          </DialogDescription>
                        </DialogHeader>
                        <SchoolForm
                          mode="edit"
                          school={school}
                          onSuccess={() => {
                            setEditSchool(null);
                            refreshSchools();
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
