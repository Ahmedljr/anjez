"use client";

import { Pin, Repeat, CheckCircle2 } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatDayMonth } from "@/lib/format-date";
import { StatusSelector } from "./StatusSelector";
import { completionDate } from "@/features/tasks/lib/priority";
import {
  IMPACT_BADGE_TONE,
  IMPACT_LABELS,
  RECURRENCE_LABELS,
} from "@/features/tasks/lib/labels";
import type { Task, TaskStatus } from "@/types/task";

interface TaskItemProps {
  task: Task;
  onChangeStatus: (taskId: string, status: TaskStatus) => void;
  onTogglePin: (taskId: string, currentlyPinned: boolean) => void;
  onOpenDetails: (task: Task) => void;
}

export function TaskItem({
  task,
  onChangeStatus,
  onTogglePin,
  onOpenDetails,
}: TaskItemProps) {
  const isDone = task.status === "done";
  const doneAt = isDone ? completionDate(task) : null;

  return (
    <Card
      onClick={() => onOpenDetails(task)}
      className={cn(
        "flex cursor-pointer items-start gap-3 transition-colors hover:border-slate-200 hover:bg-slate-50/60",
        isDone && "bg-slate-50"
      )}
    >
      <div className="mt-0.5" onClick={(e) => e.stopPropagation()}>
        <StatusSelector
          value={task.status}
          onChange={(status) => onChangeStatus(task.id, status)}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "truncate font-medium text-slate-900",
              isDone && "text-slate-400 line-through"
            )}
          >
            {task.title}
          </p>
          {task.is_pinned && (
            <Pin className="h-4 w-4 shrink-0 fill-primary-500 text-primary-500" />
          )}
        </div>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {task.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {doneAt ? (
            <Badge tone="green">
              <CheckCircle2 className="h-3 w-3" />
              أُنجزت {formatDayMonth(doneAt)}
            </Badge>
          ) : (
            <>
              <Badge tone={IMPACT_BADGE_TONE[task.impact_level]}>
                {IMPACT_LABELS[task.impact_level]}
              </Badge>
              {task.due_date && (
                <Badge tone="blue">{formatDayMonth(task.due_date)}</Badge>
              )}
              {task.recurrence !== "none" && (
                <Badge tone="slate">
                  <Repeat className="h-3 w-3" />
                  {RECURRENCE_LABELS[task.recurrence]}
                </Badge>
              )}
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin(task.id, task.is_pinned);
        }}
        aria-label="تثبيت المهمة"
        className={cn(
          "shrink-0 rounded-lg p-2 transition-colors hover:bg-slate-100",
          task.is_pinned ? "text-primary-600" : "text-slate-400"
        )}
      >
        <Pin className="h-4 w-4" />
      </button>
    </Card>
  );
}
