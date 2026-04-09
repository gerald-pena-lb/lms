"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitActivity } from "@/lib/student/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

interface ActivitySubmitDialogProps {
  activityId: string;
  activityTitle: string;
  classId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ActivitySubmitDialog({
  activityId,
  activityTitle,
  classId,
  open,
  onOpenChange,
  onSuccess,
}: ActivitySubmitDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [response, setResponse] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitActivity({
        activity_id: activityId,
        class_id: classId,
        response_json: response ? { text: response } : undefined,
        file_url: fileUrl || undefined,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Activity submitted!");
        onSuccess();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Activity</DialogTitle>
          <DialogDescription>Submit your response for &quot;{activityTitle}&quot;.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="response">Your Response</Label>
            <Textarea
              id="response"
              placeholder="Type your answer or response here..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file_url">File URL (optional)</Label>
            <Input
              id="file_url"
              placeholder="https://..."
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
