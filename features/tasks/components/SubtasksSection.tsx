"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2, ListTree } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui";
import { useTasksStore } from "./TasksProvider";
import { StatusSelector } from "./StatusSelector";
import { subtaskProgress } from "@/features/tasks/lib/subtask-progress";

/**
 * Subtasks for a task — real mini-tasks with a status (todo / in_progress /
 * done), not checkboxes. Reads and mutates the shared store optimistically; no
 * navigation or refetch. Kept distinct from the lightweight checklist so it can
 * grow into a richer entity later (estimates, dependencies, scheduling).
 */
export function SubtasksSection({ taskId }: { taskId: string }) {
  const { subtasks, addSubtask, setSubtaskStatus, removeSubtask } =
    useTasksStore();
  const items = subtasks[taskId] ?? [];
  const { total, completed, percent } = subtaskProgress(items);

  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setTitle(""); // optimistic clear — store adds it instantly
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

      <ul className="flex flex-col gap-1">
        {items.map((subtask) => (
          <li
            key={subtask.id}
            className="flex items-center gap-2.5 rounded-lg px-1 py-1"
          >
            <StatusSelector
              value={subtask.status ?? "todo"}
              onChange={(status) =>
                setSubtaskStatus(taskId, subtask.id, status)
              }
            />
            <span
              className={cn(
                "flex-1 text-sm",
                subtask.status === "done"
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
