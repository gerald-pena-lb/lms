"use client";

import { useEffect, useState, useTransition } from "react";
import { getStudentActivities } from "@/lib/student/actions";
import { ActivityList } from "@/components/student/activity-list";

export default function StudentActivitiesPage() {
  const [, startTransition] = useTransition();
  const [activities, setActivities] = useState<Parameters<typeof ActivityList>[0]["activities"]>([]);

  function loadActivities() {
    startTransition(async () => {
      const result = await getStudentActivities();
      if (!result.error) {
        setActivities(result.data as typeof activities);
      }
    });
  }

  useEffect(() => {
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activities</h1>
        <p className="text-muted-foreground">
          Complete activities to earn points and track your progress.
        </p>
      </div>

      <ActivityList activities={activities} onRefresh={loadActivities} />
    </div>
  );
}
