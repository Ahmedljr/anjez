"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import {
  IMPACT_LABELS,
  STATUS_LABELS,
  RECURRENCE_LABELS,
} from "@/features/tasks/lib/labels";
import type {
  ImpactLevel,
  Task,
  TaskInput,
  TaskStatus,
  TaskRecurrence,
  TaskUpdateInput,
} from "@/types/task";

interface TaskFormModalProps {
  open: boolean;
  task?: Task | null;
  onClose: () => void;
  onCreate?: (input: TaskInput) => Promise<unknown>;
  onUpdate?: (taskId: string, input: TaskUpdateInput) => Promise<unknown>;
}

const EMPTY_FORM = {
  title: "",
  description: "",
  impact_level: "medium" as ImpactLevel,
  start_date: "",
  due_date: "",
  status: "todo" as TaskStatus,
  recurrence: "none" as TaskRecurrence,
  is_pinned: false,
};

export function TaskFormModal({
  open,
  task,
  onClose,
  onCreate,
  onUpdate,
}: TaskFormModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    setForm(
      task
        ? {
            title: task.title,
            description: task.description ?? "",
            impact_level: task.impact_level,
            start_date: task.start_date ? task.start_date.slice(0, 10) : "",
            due_date: task.due_date ? task.due_date.slice(0, 10) : "",
            status: task.status,
            recurrence: task.recurrence,
            is_pinned: task.is_pinned,
          }
        : EMPTY_FORM
    );
  }, [open, task]);

  if (!open) return null;

  const isEditing = Boolean(task);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) return;

    // Validation: due date can't fall before the start date.
    if (form.start_date && form.due_date && form.due_date < form.start_date) {
      setFormError("تاريخ الاستحقاق يجب أن يكون بعد تاريخ البدء");
      return;
    }
    setFormError(null);

    setSubmitting(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      impact_level: form.impact_level,
      start_date: form.start_date || null,
      due_date: form.due_date || null,
      status: form.status,
      recurrence: form.recurrence,
      is_pinned: form.is_pinned,
    };

    try {
      if (isEditing && task) {
        await onUpdate?.(task.id, payload);
      } else {
        await onCreate?.(payload);
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center">
      <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? "تعديل المهمة" : "مهمة جديدة"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-medium text-slate-700">
              العنوان
            </label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="ما الذي تحتاج إلى إنجازه؟"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="description"
              className="text-sm font-medium text-slate-700"
            >
              الوصف (اختياري)
            </label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="أضف تفاصيل إضافية..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="impact_level"
                className="text-sm font-medium text-slate-700"
              >
                مستوى التأثير
              </label>
              <Select
                id="impact_level"
                value={form.impact_level}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    impact_level: e.target.value as ImpactLevel,
                  }))
                }
              >
                {(Object.keys(IMPACT_LABELS) as ImpactLevel[]).map((level) => (
                  <option key={level} value={level}>
                    {IMPACT_LABELS[level]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="status" className="text-sm font-medium text-slate-700">
                الحالة
              </label>
              <Select
                id="status"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))
                }
              >
                {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="start_date"
                className="text-sm font-medium text-slate-700"
              >
                تاريخ البدء (اختياري)
              </label>
              <Input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, start_date: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="due_date"
                className="text-sm font-medium text-slate-700"
              >
                تاريخ الاستحقاق (اختياري)
              </label>
              <Input
                id="due_date"
                type="date"
                value={form.due_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, due_date: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="recurrence"
              className="text-sm font-medium text-slate-700"
            >
              التكرار
            </label>
            <Select
              id="recurrence"
              value={form.recurrence}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  recurrence: e.target.value as TaskRecurrence,
                }))
              }
            >
              {(Object.keys(RECURRENCE_LABELS) as TaskRecurrence[]).map(
                (option) => (
                  <option key={option} value={option}>
                    {RECURRENCE_LABELS[option]}
                  </option>
                )
              )}
            </Select>
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.is_pinned}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_pinned: e.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            تثبيت هذه المهمة في الأعلى
          </label>

          <div className="mt-2 flex gap-3">
            <Button type="submit" className="flex-1" disabled={submitting}>
              {isEditing ? "حفظ التعديلات" : "إضافة المهمة"}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
