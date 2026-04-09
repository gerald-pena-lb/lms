"use client";

import { useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { Search, UserPlus, Pencil } from "lucide-react";
import { getUsers, toggleUserActive } from "@/lib/admin/actions";
import { UserForm } from "@/components/admin/user-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "@/types/database";

interface UserWithSchool {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  school_id: string | null;
  is_active: boolean;
  created_at: string;
  schools: { name: string } | null;
}

interface School {
  id: string;
  name: string;
}

interface UserTableProps {
  initialUsers: UserWithSchool[];
  schools: School[];
}

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  supervisor: "secondary",
  teacher: "outline",
  student: "outline",
};

export function UserTable({ initialUsers, schools }: UserTableProps) {
  const [users, setUsers] = useState<UserWithSchool[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isSearching, startSearchTransition] = useTransition();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserWithSchool | null>(null);

  const refreshUsers = useCallback(
    (searchVal?: string, roleVal?: string) => {
      startSearchTransition(async () => {
        const result = await getUsers(searchVal || undefined, roleVal || undefined);
        if (!result.error) {
          setUsers(result.data as UserWithSchool[]);
        }
      });
    },
    []
  );

  function handleSearch(value: string) {
    setSearch(value);
    refreshUsers(value, roleFilter);
  }

  function handleRoleFilter(value: string) {
    setRoleFilter(value);
    refreshUsers(search, value);
  }

  function handleToggleActive(id: string, currentActive: boolean) {
    startSearchTransition(async () => {
      const result = await toggleUserActive(id, !currentActive);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(currentActive ? "User deactivated" : "User activated");
        refreshUsers(search, roleFilter);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={roleFilter} onValueChange={handleRoleFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the platform. They will receive login credentials.
              </DialogDescription>
            </DialogHeader>
            <UserForm
              mode="create"
              schools={schools}
              onSuccess={() => {
                setCreateDialogOpen(false);
                refreshUsers(search, roleFilter);
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
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {isSearching ? "Searching..." : "No users found."}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant[user.role] ?? "outline"} className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.schools?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.is_active ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog
                      open={editUser?.id === user.id}
                      onOpenChange={(open) => setEditUser(open ? user : null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit User</DialogTitle>
                          <DialogDescription>
                            Update user details for {user.full_name}.
                          </DialogDescription>
                        </DialogHeader>
                        <UserForm
                          mode="edit"
                          user={user}
                          schools={schools}
                          onSuccess={() => {
                            setEditUser(null);
                            refreshUsers(search, roleFilter);
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
