"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasksStore } from "./TasksProvider";
import { combinedProgress } from "@/features/tasks/lib/subtask-progress";

/**
 * Parent task progress — combines checklist + subtask completion into one
 * roll-up. When everything is done it surfaces a "ready to complete" hint, but
 * the parent task is never auto-completed.
 */
export function TaskProgressSummary({ taskId }: { taskId: string }) {
  const { checklist, subtasks } = useTasksStore();
  const { total, completed, percent, allDone } = combinedProgress(
    checklist[taskId] ?? [],
    subtasks[taskId] ?? []
  );

  return (
    <div className="mt-4 rounded-xl bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">التقدّم</span>
        {total > 0 && (
          <span className="text-sm font-medium text-slate-500">
            {completed} / {total} · {percent}%
          </span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            allDone ? "bg-emerald-500" : "bg-primary-500"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {allDone && (
        <div className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          كل العناصر مكتملة — المهمة جاهزة للإنجاز
        </div>
      )}
    </div>
  );
}
