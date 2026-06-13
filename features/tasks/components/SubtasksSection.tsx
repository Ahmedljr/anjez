"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2, Check, ListTree, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui";
import { useTasksStore } from "./TasksProvider";
import { subtaskProgress } from "@/features/tasks/lib/subtask-progress";

/**
 * Subtasks for a single task, rendered inside the task details modal. Reads and
 * mutates the shared store directly — every change is optimistic and instant,
 * with no navigation or server refetch.
 */
export function SubtasksSection({ taskId }: { taskId: string }) {
  const { subtasks, addSubtask, toggleSubtask, removeSubtask } = useTasksStore();
  const items = subtasks[taskId] ?? [];
  const { total, completed, percent, allDone } = subtaskProgress(items);

  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setTitle(""); // optimistic clear — the store adds it instantly
    await addSubtask(taskId, trimmed);
    setSubmitting(false);
  }

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <ListTree className="h-4 w-4 text-slate-400" />
          المهام الفرعية
        </span>
        {total > 0 && (
          <span className="text-sm font-medium text-slate-500">
            {completed} / {total} · {percent}%
          </span>
        )}
      </div>

      {total > 0 && (
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              allDone ? "bg-emerald-500" : "bg-primary-500"
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {allDone && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          كل المهام الفرعية مكتملة — المهمة جاهزة للإنجاز
        </div>
      )}

      <ul className="flex flex-col gap-1.5">
        {items.map((subtask) => (
          <li
            key={subtask.id}
            className="group flex items-center gap-2.5 rounded-lg px-1 py-1"
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={subtask.is_done}
              onClick={() =>
                toggleSubtask(taskId, subtask.id, !subtask.is_done)
              }
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                subtask.is_done
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-slate-300 text-transparent hover:border-emerald-400"
              )}
            >
              <Check className="h-3 w-3" />
            </button>
            <span
              className={cn(
                "flex-1 text-sm",
                subtask.is_done
                  ? "text-slate-400 line-through"
                  : "text-slate-700"
              )}
            >
              {subtask.title}
            </span>
            <button
              type="button"
              onClick={() => removeSubtask(taskId, subtask.id)}
              aria-label="حذف المهمة الفرعية"
              className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="mt-2 flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="أضف مهمة فرعية..."
          aria-label="عنوان المهمة الفرعية"
          className="h-9 text-sm"
        />
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          aria-label="إضافة مهمة فرعية"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors hover:bg-primary-100 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
