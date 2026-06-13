"use client";

import {
  X,
  Pencil,
  Trash2,
  CalendarDays,
  CalendarClock,
  Repeat,
  Flag,
  Clock,
  Pin,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { formatFullDate } from "@/lib/format-date";
import { StatusSelector } from "./StatusSelector";
import { ChecklistSection } from "./ChecklistSection";
import { SubtasksSection } from "./SubtasksSection";
import { TaskProgressSummary } from "./TaskProgressSummary";
import {
  IMPACT_BADGE_TONE,
  IMPACT_LABELS,
  RECURRENCE_LABELS,
} from "@/features/tasks/lib/labels";
import type { Task, TaskStatus } from "@/types/task";

interface TaskDetailsModalProps {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onChangeStatus: (taskId: string, status: TaskStatus) => void;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return formatFullDate(value);
}

interface MetaRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function MetaRow({ icon, label, value }: MetaRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

export function TaskDetailsModal({
  task,
  onClose,
  onEdit,
  onDelete,
  onChangeStatus,
}: TaskDetailsModalProps) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center">
      <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2">
            <h2 className="text-lg font-bold text-slate-900">{task.title}</h2>
            {task.is_pinned && (
              <Pin className="mt-1 h-4 w-4 shrink-0 fill-primary-500 text-primary-500" />
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status selector */}
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-slate-500">الحالة</span>
          <StatusSelector
            value={task.status}
            onChange={(status) => onChangeStatus(task.id, status)}
            variant="full"
          />
        </div>

        {/* Notes */}
        {task.description && (
          <p className="mb-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
            {task.description}
          </p>
        )}

        {/* Checklist — lightweight execution steps */}
        <ChecklistSection taskId={task.id} />

        {/* Subtasks — real status-driven mini-tasks */}
        <SubtasksSection taskId={task.id} />

        {/* Dates */}
        <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100 px-3">
          <MetaRow
            icon={<Flag className="h-4 w-4" />}
            label="مستوى التأثير"
            value={
              <Badge tone={IMPACT_BADGE_TONE[task.impact_level]}>
                {IMPACT_LABELS[task.impact_level]}
              </Badge>
            }
          />
          <MetaRow
            icon={<CalendarDays className="h-4 w-4" />}
            label="تاريخ البدء"
            value={formatDate(task.start_date)}
          />
          <MetaRow
            icon={<CalendarClock className="h-4 w-4" />}
            label="تاريخ الاستحقاق"
            value={formatDate(task.due_date)}
          />
          <MetaRow
            icon={<Repeat className="h-4 w-4" />}
            label="التكرار"
            value={RECURRENCE_LABELS[task.recurrence]}
          />
          <MetaRow
            icon={<Clock className="h-4 w-4" />}
            label="تاريخ الإنشاء"
            value={formatDate(task.created_at)}
          />
        </div>

        {/* Progress — combined checklist + subtask roll-up */}
        <TaskProgressSummary taskId={task.id} />

        <div className="mt-5 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-4 w-4" />
            تعديل
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
        </div>
      </div>
    </div>
  );
}
