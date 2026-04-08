"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createUser, updateUser } from "@/lib/admin/actions";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/lib/validators/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface School {
  id: string;
  name: string;
}

interface UserData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  school_id: string | null;
  is_active: boolean;
}

interface UserFormProps {
  mode: "create" | "edit";
  user?: UserData;
  schools: School[];
  onSuccess: () => void;
}

function CreateUserForm({ schools, onSuccess }: { schools: School[]; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { full_name: "", email: "", password: "", role: "student", school_id: "" },
  });

  function onSubmit(data: CreateUserInput) {
    startTransition(async () => {
      const result = await createUser(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User created");
        onSuccess();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input id="full_name" {...register("full_name")} />
        {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select value={watch("role")} onValueChange={(v) => setValue("role", v as CreateUserInput["role"])}>
          <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="supervisor">Supervisor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>School</Label>
        <Select value={watch("school_id") ?? ""} onValueChange={(v) => setValue("school_id", v === "none" ? "" : v)}>
          <SelectTrigger><SelectValue placeholder="Select a school (optional)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No school</SelectItem>
            {schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create User"}
      </Button>
    </form>
  );
}

function EditUserForm({ user, schools, onSuccess }: { user: UserData; schools: School[]; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      full_name: user.full_name,
      email: user.email,
      role: user.role as UpdateUserInput["role"],
      school_id: user.school_id ?? "",
      is_active: user.is_active,
    },
  });

  function onSubmit(data: UpdateUserInput) {
    startTransition(async () => {
      const result = await updateUser(user.id, data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User updated");
        onSuccess();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input id="full_name" {...register("full_name")} />
        {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select value={watch("role")} onValueChange={(v) => setValue("role", v as UpdateUserInput["role"])}>
          <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="supervisor">Supervisor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>School</Label>
        <Select value={watch("school_id") ?? ""} onValueChange={(v) => setValue("school_id", v === "none" ? "" : v)}>
          <SelectTrigger><SelectValue placeholder="Select a school (optional)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No school</SelectItem>
            {schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_active" className="h-4 w-4 rounded border-gray-300" {...register("is_active")} />
        <Label htmlFor="is_active">Active</Label>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Updating..." : "Update User"}
      </Button>
    </form>
  );
}

export function UserForm({ mode, user, schools, onSuccess }: UserFormProps) {
  if (mode === "edit" && user) {
    return <EditUserForm user={user} schools={schools} onSuccess={onSuccess} />;
  }
  return <CreateUserForm schools={schools} onSuccess={onSuccess} />;
}
