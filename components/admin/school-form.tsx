"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createSchool, updateSchool } from "@/lib/admin/actions";
import {
  createSchoolSchema,
  updateSchoolSchema,
  type CreateSchoolInput,
  type UpdateSchoolInput,
} from "@/lib/validators/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SchoolFormProps {
  mode: "create" | "edit";
  school?: {
    id: string;
    name: string;
    code: string;
    address: string | null;
    is_active: boolean;
  };
  onSuccess: () => void;
}

function CreateSchoolForm({ onSuccess }: { onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateSchoolInput>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: { name: "", code: "", address: "" },
  });

  function onSubmit(data: CreateSchoolInput) {
    startTransition(async () => {
      const result = await createSchool(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("School created");
        onSuccess();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">School Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">School Code</Label>
        <Input id="code" placeholder="e.g. PSA" {...register("code")} />
        {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" placeholder="Optional" {...register("address")} />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create School"}
      </Button>
    </form>
  );
}

function EditSchoolForm({ school, onSuccess }: { school: NonNullable<SchoolFormProps["school"]>; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateSchoolInput>({
    resolver: zodResolver(updateSchoolSchema),
    defaultValues: {
      name: school.name,
      code: school.code,
      address: school.address ?? "",
      is_active: school.is_active,
    },
  });

  function onSubmit(data: UpdateSchoolInput) {
    startTransition(async () => {
      const result = await updateSchool(school.id, data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("School updated");
        onSuccess();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">School Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">School Code</Label>
        <Input id="code" placeholder="e.g. PSA" {...register("code")} />
        {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" placeholder="Optional" {...register("address")} />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          className="h-4 w-4 rounded border-gray-300"
          {...register("is_active")}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Updating..." : "Update School"}
      </Button>
    </form>
  );
}

export function SchoolForm({ mode, school, onSuccess }: SchoolFormProps) {
  if (mode === "edit" && school) {
    return <EditSchoolForm school={school} onSuccess={onSuccess} />;
  }
  return <CreateSchoolForm onSuccess={onSuccess} />;
}
