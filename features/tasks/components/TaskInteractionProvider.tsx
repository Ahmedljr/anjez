"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTasksStore } from "./TasksProvider";
import { TaskDetailsModal } from "./TaskDetailsModal";
import { TaskFormModal } from "./TaskFormModal";
import type { Task, TaskStatus, TaskUpdateInput } from "@/types/task";

interface TaskInteractionContextValue {
  /** Open the details modal for a task from anywhere in the app. */
  openDetails: (task: Task) => void;
}

const TaskInteractionContext =
  createContext<TaskInteractionContextValue | null>(null);

export function useTaskInteraction(): TaskInteractionContextValue {
  const ctx = useContext(TaskInteractionContext);
  if (!ctx) {
    throw new Error(
      "useTaskInteraction must be used within a TaskInteractionProvider"
    );
  }
  return ctx;
}

/**
 * Owns the app-wide task details + edit experience. Any clickable task (dashboard
 * cards, task list rows) opens the same details modal. Mutations go through the
 * shared tasks store — optimistic, and reflected everywhere without a server
 * round-trip.
 *
 * The selected task is stored as an ID and derived from the live store so the
 * modal always reflects the committed store state — avoiding a stale-snapshot
 * race where the task object captured at click-time predates the relational-map
 * commit (subtasks/checklist empty-array registration) from addTask.
 */
export function TaskInteractionProvider({ children }: { children: ReactNode }) {
  const { tasks, editTask, removeTask, setStatus } = useTasksStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Derive the current task from the live store so the modal is always in sync
  // with committed state (status changes, edits) without manual snapshot updates.
  const detailsTask = useMemo(
    () => (selectedTaskId ? (tasks.find((t) => t.id === selectedTaskId) ?? null) : null),
    [selectedTaskId, tasks]
  );

  const openDetails = useCallback((task: Task) => setSelectedTaskId(task.id), []);

  const handleChangeStatus = useCallback(
    (taskId: string, status: TaskStatus) => {
      // Store update propagates to detailsTask automatically via the live derivation.
      void setStatus(taskId, status);
    },
    [setStatus]
  );

  const handleDelete = useCallback(
    (taskId: string) => {
      if (!window.confirm("هل تريد حذف هذه المهمة؟")) return;
      setSelectedTaskId(null);
      void removeTask(taskId);
    },
    [removeTask]
  );

  const handleEdit = useCallback((task: Task) => {
    setSelectedTaskId(null);
    setEditingTask(task);
  }, []);

  const handleUpdate = useCallback(
    async (taskId: string, input: TaskUpdateInput) => {
      await editTask(taskId, input);
    },
    [editTask]
  );

  return (
    <TaskInteractionContext.Provider value={{ openDetails }}>
      {children}

      <TaskDetailsModal
        task={detailsTask}
        onClose={() => setSelectedTaskId(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onChangeStatus={handleChangeStatus}
      />

      <TaskFormModal
        open={Boolean(editingTask)}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onUpdate={handleUpdate}
      />
    </TaskInteractionContext.Provider>
  );
}
