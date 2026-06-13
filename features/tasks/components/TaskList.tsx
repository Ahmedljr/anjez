"use client";

import { useCallback, useMemo, useState } from "react";
import { ListChecks, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui";
import { useTasksStore } from "@/features/tasks/components/TasksProvider";
import { useTaskInteraction } from "@/features/tasks/components/TaskInteractionProvider";
import {
  activeTasks,
  completedTasks,
  overdueTasks,
} from "@/features/tasks/lib/priority";
import { combinedProgress } from "@/features/tasks/lib/subtask-progress";
import { QuickAddTask } from "./QuickAddTask";
import { TaskItem } from "./TaskItem";

export type TaskListFilter = "active" | "completed" | "overdue";

interface TaskListProps {
  initialFilter?: TaskListFilter;
}

export function TaskList({ initialFilter = "active" }: TaskListProps) {
  const { tasks, subtasks, checklist, error, addTask, setStatus, togglePin } =
    useTasksStore();
  const { openDetails } = useTaskInteraction();

  // The active filter is client state: switching tabs is a pure in-memory
  // re-filter of the shared store — no navigation, server round-trip or skeleton.
  const [filter, setFilter] = useState<TaskListFilter>(initialFilter);

  const selectFilter = useCallback((next: TaskListFilter) => {
    setFilter(next);
    // Keep the URL (and deep-links / refresh) in sync without a navigation.
    const url = next === "active" ? "/tasks" : `/tasks?filter=${next}`;
    window.history.replaceState(null, "", url);
  }, []);

  // Derive each list once per task-list change, not on every tab toggle.
  const active = useMemo(() => activeTasks(tasks), [tasks]);
  const completed = useMemo(() => completedTasks(tasks), [tasks]);
  const overdue = useMemo(() => overdueTasks(tasks), [tasks]);

  const visible =
    filter === "completed" ? completed : filter === "overdue" ? overdue : active;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">المهام</h1>
        <p className="mt-1 text-sm text-slate-500">{HEADINGS[filter]}</p>
      </div>

      <div className="flex flex-col gap-4">
        {filter === "overdue" ? (
          <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
            <span className="text-sm font-medium text-amber-700">
              ⚠️ المهام المتأخرة ({visible.length})
            </span>
            <button
              type="button"
              onClick={() => selectFilter("active")}
              className="flex items-center gap-1 text-sm text-amber-700 hover:underline"
            >
              <X className="h-4 w-4" />
              إلغاء التصفية
            </button>
          </div>
        ) : (
          <>
            {/* Active / Completed tabs — instant client-side switch */}
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
              <TabButton
                label="المهام الحالية"
                count={active.length}
                active={filter === "active"}
                onClick={() => selectFilter("active")}
              />
              <TabButton
                label="المهام المكتملة"
                count={completed.length}
                active={filter === "completed"}
                onClick={() => selectFilter("completed")}
              />
            </div>

            {filter === "active" && <QuickAddTask onAdd={addTask} />}
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {visible.length === 0 ? (
          <EmptyState
            icon={
              filter === "completed" ? (
                <CheckCircle2 className="h-10 w-10" />
              ) : (
                <ListChecks className="h-10 w-10" />
              )
            }
            title={EMPTY_TITLE[filter]}
            description={EMPTY_DESCRIPTION[filter]}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((task) => {
              const cp = combinedProgress(
                checklist[task.id] ?? [],
                subtasks[task.id] ?? []
              );
              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  progressSummary={
                    cp.total > 0
                      ? { completed: cp.completed, total: cp.total }
                      : null
                  }
                  onChangeStatus={setStatus}
                  onTogglePin={togglePin}
                  onOpenDetails={openDetails}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const HEADINGS: Record<TaskListFilter, string> = {
  active: "كل مهامك في مكان واحد، مرتبة حسب أولويتها",
  completed: "أرشيف إنجازاتك — كل ما أكملته من مهام",
  overdue: "المهام التي تجاوزت موعد استحقاقها",
};

const EMPTY_TITLE: Record<TaskListFilter, string> = {
  active: "لا توجد مهام نشطة",
  completed: "لا توجد مهام مكتملة بعد",
  overdue: "لا توجد مهام متأخرة",
};

const EMPTY_DESCRIPTION: Record<TaskListFilter, string> = {
  active: "ابدأ بإضافة أول مهمة لك من الحقل أعلاه",
  completed: "أنجز مهامك وستظهر هنا في أرشيفك",
  overdue: "أنت على المسار الصحيح — لا شيء متأخر",
};

interface TabButtonProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, count, active, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-white text-primary-700 shadow-sm"
          : "text-slate-500 hover:text-slate-700"
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs",
          active ? "bg-primary-50 text-primary-600" : "bg-slate-200 text-slate-500"
        )}
      >
        {count}
      </span>
    </button>
  );
}
