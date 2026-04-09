"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronRight,
  BookOpen, FileText, Gamepad2,
} from "lucide-react";
import {
  createModule, updateModule, deleteModule,
  createLesson, updateLesson, deleteLesson,
  createActivity, updateActivity, deleteActivity,
} from "@/lib/supervisor/actions";
import type {
  CreateModuleInput, UpdateModuleInput,
  CreateLessonInput, UpdateLessonInput,
  CreateActivityInput, UpdateActivityInput,
} from "@/lib/validators/supervisor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Module {
  id: string; title: string; description: string | null; sort_order: number; status: string;
}
interface Lesson {
  id: string; module_id: string; title: string; description: string | null;
  sort_order: number; status: string; teacher_notes: string | null; timing_guide: string | null;
}
interface Activity {
  id: string; lesson_id: string; title: string; type: string;
  sort_order: number; points: number; time_limit_seconds: number | null;
}

interface CourseBuilderProps {
  courseId: string;
  modules: Module[];
  lessons: Lesson[];
  activities: Activity[];
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  published: "default", draft: "secondary", archived: "outline",
};

const activityTypeLabels: Record<string, string> = {
  quiz: "Quiz", drag_and_drop: "Drag & Drop", matching: "Matching",
  flashcards: "Flashcards", poll: "Poll", game_challenge: "Game Challenge",
  assignment_upload: "Assignment Upload", interactive_video: "Interactive Video",
  fill_in_blank: "Fill in Blank", story_sequencing: "Story Sequencing",
  image_recognition: "Image Recognition", audio_recognition: "Audio Recognition",
  video_response: "Video Response", discussion_prompt: "Discussion Prompt",
};

export function CourseBuilder({ courseId, modules, lessons, activities }: CourseBuilderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(modules.map(m => m.id)));
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  // Dialog state
  const [dialog, setDialog] = useState<{
    type: "module" | "lesson" | "activity";
    mode: "create" | "edit";
    parentId?: string;
    item?: Module | Lesson | Activity;
  } | null>(null);

  function toggleModule(id: string) {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleLesson(id: string) {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function refresh() {
    router.refresh();
  }

  function handleDelete(type: "module" | "lesson" | "activity", id: string, title: string) {
    const msg = type === "module"
      ? `Delete module "${title}" and all its lessons and activities?`
      : type === "lesson"
        ? `Delete lesson "${title}" and all its activities?`
        : `Delete activity "${title}"?`;
    if (!confirm(msg)) return;
    startTransition(async () => {
      const fn = type === "module" ? deleteModule : type === "lesson" ? deleteLesson : deleteActivity;
      const result = await fn(id, courseId);
      if (result.error) toast.error(result.error);
      else { toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted`); refresh(); }
    });
  }

  const moduleLessons = (moduleId: string) => lessons.filter(l => l.module_id === moduleId);
  const lessonActivities = (lessonId: string) => activities.filter(a => a.lesson_id === lessonId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Course Structure</h2>
        <Button size="sm" onClick={() => setDialog({ type: "module", mode: "create" })}>
          <Plus className="mr-1 h-4 w-4" />Add Module
        </Button>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No modules yet. Add your first module to start building the curriculum.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {modules.map((mod) => (
            <Card key={mod.id}>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleModule(mod.id)} className="p-0.5">
                    {expandedModules.has(mod.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base flex-1">{mod.title}</CardTitle>
                  <Badge variant={statusVariant[mod.status]} className="capitalize text-xs">{mod.status}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDialog({ type: "module", mode: "edit", item: mod })}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete("module", mod.id, mod.title)} disabled={isPending}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              {expandedModules.has(mod.id) && (
                <CardContent className="pt-0 pb-3 px-4">
                  <div className="ml-6 space-y-1.5">
                    {moduleLessons(mod.id).map((lesson) => (
                      <div key={lesson.id}>
                        <div className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50">
                          <button onClick={() => toggleLesson(lesson.id)} className="p-0.5">
                            {expandedLessons.has(lesson.id) ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </button>
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm flex-1">{lesson.title}</span>
                          <Badge variant={statusVariant[lesson.status]} className="capitalize text-xs">{lesson.status}</Badge>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDialog({ type: "lesson", mode: "edit", item: lesson })}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete("lesson", lesson.id, lesson.title)} disabled={isPending}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                        {expandedLessons.has(lesson.id) && (
                          <div className="ml-8 space-y-1 py-1">
                            {lessonActivities(lesson.id).map((activity) => (
                              <div key={activity.id} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50">
                                <Gamepad2 className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm flex-1">{activity.title}</span>
                                <Badge variant="outline" className="text-xs">{activityTypeLabels[activity.type] ?? activity.type}</Badge>
                                <span className="text-xs text-muted-foreground">{activity.points} pts</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDialog({ type: "activity", mode: "edit", item: activity, parentId: lesson.id })}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete("activity", activity.id, activity.title)} disabled={isPending}>
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            ))}
                            <Button variant="ghost" size="sm" className="text-xs h-7 ml-5" onClick={() => setDialog({ type: "activity", mode: "create", parentId: lesson.id })}>
                              <Plus className="mr-1 h-3 w-3" />Add Activity
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setDialog({ type: "lesson", mode: "create", parentId: mod.id })}>
                      <Plus className="mr-1 h-3 w-3" />Add Lesson
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Module Dialog */}
      <Dialog open={dialog?.type === "module"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog?.mode === "create" ? "Add Module" : "Edit Module"}</DialogTitle>
            <DialogDescription>
              {dialog?.mode === "create" ? "Add a new module to this course." : "Update module details."}
            </DialogDescription>
          </DialogHeader>
          {dialog?.type === "module" && (
            <ModuleFormInline
              mode={dialog.mode}
              courseId={courseId}
              module={dialog.item as Module | undefined}
              onSuccess={() => { setDialog(null); refresh(); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={dialog?.type === "lesson"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog?.mode === "create" ? "Add Lesson" : "Edit Lesson"}</DialogTitle>
            <DialogDescription>
              {dialog?.mode === "create" ? "Add a new lesson to this module." : "Update lesson details."}
            </DialogDescription>
          </DialogHeader>
          {dialog?.type === "lesson" && (
            <LessonFormInline
              mode={dialog.mode}
              courseId={courseId}
              moduleId={dialog.parentId ?? (dialog.item as Lesson)?.module_id ?? ""}
              lesson={dialog.item as Lesson | undefined}
              onSuccess={() => { setDialog(null); refresh(); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={dialog?.type === "activity"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog?.mode === "create" ? "Add Activity" : "Edit Activity"}</DialogTitle>
            <DialogDescription>
              {dialog?.mode === "create" ? "Add a new activity to this lesson." : "Update activity details."}
            </DialogDescription>
          </DialogHeader>
          {dialog?.type === "activity" && (
            <ActivityFormInline
              mode={dialog.mode}
              courseId={courseId}
              lessonId={dialog.parentId ?? (dialog.item as Activity)?.lesson_id ?? ""}
              activity={dialog.item as Activity | undefined}
              onSuccess={() => { setDialog(null); refresh(); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// Inline Form Components
// ============================================================

function ModuleFormInline({ mode, courseId, module, onSuccess }: {
  mode: "create" | "edit"; courseId: string; module?: Module; onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(module?.title ?? "");
  const [description, setDescription] = useState(module?.description ?? "");
  const [status, setStatus] = useState(module?.status ?? "draft");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (mode === "create") {
        const result = await createModule({ course_id: courseId, title, description } as CreateModuleInput);
        if (result.error) toast.error(result.error); else { toast.success("Module added"); onSuccess(); }
      } else {
        const result = await updateModule(module!.id, courseId, { title, description, status } as UpdateModuleInput);
        if (result.error) toast.error(result.error); else { toast.success("Module updated"); onSuccess(); }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={2} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      {mode === "edit" && (
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : mode === "create" ? "Add Module" : "Update Module"}
      </Button>
    </form>
  );
}

function LessonFormInline({ mode, courseId, moduleId, lesson, onSuccess }: {
  mode: "create" | "edit"; courseId: string; moduleId: string; lesson?: Lesson; onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [description, setDescription] = useState(lesson?.description ?? "");
  const [teacherNotes, setTeacherNotes] = useState(lesson?.teacher_notes ?? "");
  const [timingGuide, setTimingGuide] = useState(lesson?.timing_guide ?? "");
  const [status, setStatus] = useState(lesson?.status ?? "draft");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (mode === "create") {
        const result = await createLesson({
          module_id: moduleId, title, description, teacher_notes: teacherNotes, timing_guide: timingGuide,
        } as CreateLessonInput, courseId);
        if (result.error) toast.error(result.error); else { toast.success("Lesson added"); onSuccess(); }
      } else {
        const result = await updateLesson(lesson!.id, courseId, {
          title, description, teacher_notes: teacherNotes, timing_guide: timingGuide, status,
        } as UpdateLessonInput);
        if (result.error) toast.error(result.error); else { toast.success("Lesson updated"); onSuccess(); }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={2} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Teacher Notes</Label>
        <Input value={teacherNotes} onChange={(e) => setTeacherNotes(e.target.value)} placeholder="Key talking points..." />
      </div>
      <div className="space-y-2">
        <Label>Timing Guide</Label>
        <Input value={timingGuide} onChange={(e) => setTimingGuide(e.target.value)} placeholder="e.g. 15 min intro, 20 min activity" />
      </div>
      {mode === "edit" && (
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : mode === "create" ? "Add Lesson" : "Update Lesson"}
      </Button>
    </form>
  );
}

function ActivityFormInline({ mode, courseId, lessonId, activity, onSuccess }: {
  mode: "create" | "edit"; courseId: string; lessonId: string; activity?: Activity; onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(activity?.title ?? "");
  const [type, setType] = useState(activity?.type ?? "quiz");
  const [points, setPoints] = useState(String(activity?.points ?? 0));
  const [timeLimit, setTimeLimit] = useState(activity?.time_limit_seconds ? String(activity.time_limit_seconds) : "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const data = {
        title, type, points: Number(points), time_limit_seconds: timeLimit ? Number(timeLimit) : "",
      };
      if (mode === "create") {
        const result = await createActivity({ ...data, lesson_id: lessonId } as CreateActivityInput, courseId);
        if (result.error) toast.error(result.error); else { toast.success("Activity added"); onSuccess(); }
      } else {
        const result = await updateActivity(activity!.id, courseId, data as UpdateActivityInput);
        if (result.error) toast.error(result.error); else { toast.success("Activity updated"); onSuccess(); }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={2} />
      </div>
      <div className="space-y-2">
        <Label>Activity Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(activityTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Points</Label>
          <Input type="number" min="0" value={points} onChange={(e) => setPoints(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Time Limit (seconds)</Label>
          <Input type="number" min="0" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} placeholder="Optional" />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : mode === "create" ? "Add Activity" : "Update Activity"}
      </Button>
    </form>
  );
}
