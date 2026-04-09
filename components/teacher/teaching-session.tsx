"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Play, StopCircle } from "lucide-react";
import { startTeachingSession, endTeachingSession, getActiveSession, getClassLessons } from "@/lib/teacher/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface ClassItem {
  id: string;
  name: string;
}

interface ActiveSession {
  id: string;
  started_at: string;
  lessons: { title: string } | null;
  classes: { name: string } | null;
}

export function TeachingSession({ classes, initialSession }: { classes: ClassItem[]; initialSession: ActiveSession | null }) {
  const [isPending, startTransition] = useTransition();
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(initialSession);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [lessons, setLessons] = useState<Array<{ lesson_id: string; lessons: { id: string; title: string } | null }>>([]);

  function handleClassChange(classId: string) {
    setSelectedClass(classId);
    setSelectedLesson("");
    startTransition(async () => {
      const result = await getClassLessons(classId);
      setLessons(result.data as typeof lessons);
    });
  }

  function handleStart() {
    if (!selectedClass || !selectedLesson) {
      toast.error("Please select a class and lesson");
      return;
    }
    startTransition(async () => {
      const result = await startTeachingSession({
        class_id: selectedClass,
        lesson_id: selectedLesson,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Teaching session started!");
        const session = await getActiveSession();
        setActiveSession(session.data as ActiveSession);
      }
    });
  }

  function handleEnd() {
    if (!activeSession) return;
    startTransition(async () => {
      const result = await endTeachingSession(activeSession.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Teaching session ended");
        setActiveSession(null);
      }
    });
  }

  if (activeSession) {
    const started = new Date(activeSession.started_at);
    return (
      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            <CardTitle>Active Teaching Session</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Class</p>
              <p className="font-semibold">{activeSession.classes?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lesson</p>
              <p className="font-semibold">{activeSession.lessons?.title ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Started</p>
              <p className="font-semibold">{started.toLocaleTimeString()}</p>
            </div>
          </div>
          <Button variant="destructive" onClick={handleEnd} disabled={isPending} className="w-full">
            <StopCircle className="mr-2 h-4 w-4" />
            {isPending ? "Ending..." : "End Session"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start Teaching Session</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Class</Label>
            <Select value={selectedClass} onValueChange={handleClassChange}>
              <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
              <SelectContent>
                {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Lesson</Label>
            <Select value={selectedLesson} onValueChange={setSelectedLesson} disabled={!selectedClass}>
              <SelectTrigger><SelectValue placeholder="Select a lesson" /></SelectTrigger>
              <SelectContent>
                {lessons.map((l) => (
                  <SelectItem key={l.lesson_id} value={l.lesson_id}>
                    {l.lessons?.title ?? "—"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleStart} disabled={isPending || !selectedClass || !selectedLesson} className="w-full">
          <Play className="mr-2 h-4 w-4" />
          {isPending ? "Starting..." : "Start Teaching"}
        </Button>
      </CardContent>
    </Card>
  );
}
