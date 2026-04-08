"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createCourse, updateCourse } from "@/lib/supervisor/actions";
import {
  createCourseSchema,
  updateCourseSchema,
  type CreateCourseInput,
  type UpdateCourseInput,
} from "@/lib/validators/supervisor";
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

interface CourseFormProps {
  mode: "create" | "edit";
  course?: {
    id: string;
    title: string;
    description: string | null;
    level: string | null;
    school_id: string | null;
    status: string;
  };
  schools: School[];
  onSuccess: () => void;
}

function CreateCourseForm({ schools, onSuccess }: { schools: School[]; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { title: "", description: "", level: "", school_id: "" },
  });

  function onSubmit(data: CreateCourseInput) {
    startTransition(async () => {
      const result = await createCourse(data);
      if (result.error) toast.error(result.error);
      else { toast.success("Course created"); onSuccess(); }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Course Title</Label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="level">Level</Label>
        <Input id="level" placeholder="e.g. Level 1" {...register("level")} />
      </div>
      <div className="space-y-2">
        <Label>School</Label>
        <Select value={watch("school_id") ?? ""} onValueChange={(v) => setValue("school_id", v === "none" ? "" : v)}>
          <SelectTrigger><SelectValue placeholder="Global (all schools)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Global (all schools)</SelectItem>
            {schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create Course"}
      </Button>
    </form>
  );
}

function EditCourseForm({ course, schools, onSuccess }: { course: NonNullable<CourseFormProps["course"]>; schools: School[]; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<UpdateCourseInput>({
    resolver: zodResolver(updateCourseSchema),
    defaultValues: {
      title: course.title,
      description: course.description ?? "",
      level: course.level ?? "",
      school_id: course.school_id ?? "",
      status: course.status as UpdateCourseInput["status"],
    },
  });

  function onSubmit(data: UpdateCourseInput) {
    startTransition(async () => {
      const result = await updateCourse(course.id, data);
      if (result.error) toast.error(result.error);
      else { toast.success("Course updated"); onSuccess(); }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Course Title</Label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="level">Level</Label>
        <Input id="level" placeholder="e.g. Level 1" {...register("level")} />
      </div>
      <div className="space-y-2">
        <Label>School</Label>
        <Select value={watch("school_id") ?? ""} onValueChange={(v) => setValue("school_id", v === "none" ? "" : v)}>
          <SelectTrigger><SelectValue placeholder="Global (all schools)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Global (all schools)</SelectItem>
            {schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={watch("status")} onValueChange={(v) => setValue("status", v as UpdateCourseInput["status"])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Updating..." : "Update Course"}
      </Button>
    </form>
  );
}

export function CourseForm({ mode, course, schools, onSuccess }: CourseFormProps) {
  if (mode === "edit" && course) return <EditCourseForm course={course} schools={schools} onSuccess={onSuccess} />;
  return <CreateCourseForm schools={schools} onSuccess={onSuccess} />;
}
