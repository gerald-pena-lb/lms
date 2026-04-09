"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProgressItem {
  id: string;
  lesson_id: string;
  class_id: string;
  completion_percentage: number;
  completed_at: string | null;
  started_at: string | null;
  lessons: { title: string } | null;
  classes: { name: string } | null;
}

export function ProgressView({ progress }: { progress: ProgressItem[] }) {
  if (progress.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No progress recorded yet. Start working on your assigned lessons!
      </div>
    );
  }

  // Group by class
  const grouped: Record<string, { name: string; items: ProgressItem[] }> = {};
  for (const p of progress) {
    const key = p.class_id;
    if (!grouped[key]) {
      grouped[key] = { name: p.classes?.name ?? "Unknown Class", items: [] };
    }
    grouped[key].items.push(p);
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([classId, group]) => {
        const avg = Math.round(
          group.items.reduce((sum, p) => sum + p.completion_percentage, 0) / group.items.length
        );
        return (
          <Card key={classId}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>{group.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Average:</span>
                  <Badge variant={avg === 100 ? "default" : "secondary"}>{avg}%</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.items.map((p) => (
                  <div key={p.id} className="flex items-center gap-4">
                    <span className="text-sm flex-1 min-w-0 truncate">
                      {p.lessons?.title ?? "—"}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${p.completion_percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {p.completion_percentage}%
                      </span>
                      {p.completed_at && (
                        <Badge variant="default" className="text-xs">Done</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
