"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2, Check, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui";
import { useTasksStore } from "./TasksProvider";
import { checklistProgress } from "@/features/tasks/lib/subtask-progress";

/**
 * Lightweight checklist for a task: checked / unchecked only, no status. Built
 * to feel instant (Notes / Notion style). Reads and mutates the shared store
 * optimistically — no navigation or refetch.
 */
export function ChecklistSection({ taskId }: { taskId: string }) {
  const { checklist, addChecklistItem, toggleChecklistItem, removeChecklistItem } =
    useTasksStore();
  const items = checklist[taskId] ?? [];
  const { total, completed } = checklistProgress(items);

  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setTitle(""); // optimistic clear — store adds it instantly
    await addChecklistItem(taskId, trimmed);
    setSubmitting(false);
  }

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <ListChecks className="h-4 w-4 text-slate-400" />
          قائمة التحقق
        </span>
        {total > 0 && (
          <span className="text-sm font-medium text-slate-400">
            {completed}/{total}
          </span>
        )}
      </div>

      <ul className="flex flex-col">
        {items.length === 0 && (
          <li className="flex flex-col items-center gap-2 py-4 text-center">
            <Check className="h-6 w-6 text-slate-300 opacity-30" />
            <span className="text-sm text-slate-400">لا توجد عناصر بعد — أضف أول عنصر أدناه</span>
          </li>
        )}
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2.5 py-1">
            <button
              type="button"
              role="checkbox"
              aria-checked={item.is_checked}
              onClick={() =>
                toggleChecklistItem(taskId, item.id, !item.is_checked)
              }
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                item.is_checked
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-slate-300 text-transparent hover:border-primary-400"
              )}
            >
              <Check className="h-2.5 w-2.5" />
            </button>
            <span
              className={cn(
                "flex-1 text-sm",
                item.is_checked
                  ? "text-slate-400 line-through"
                  : "text-slate-700"
              )}
            >
              {item.title}
            </span>
            <button
              type="button"
              onClick={() => removeChecklistItem(taskId, item.id)}
              aria-label="حذف العنصر"
              className="rounded p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="mt-1.5 flex items-center gap-2">
        <Plus className="h-4 w-4 shrink-0 text-slate-400" />
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="أضف عنصرًا..."
          aria-label="عنصر قائمة تحقق جديد"
          className="h-8 border-0 bg-transparent px-0 text-sm focus:ring-0"
        />
        <button type="submit" disabled={submitting || !title.trim()} className="sr-only">
          إضافة
        </button>
      </form>
    </div>
  );
}
