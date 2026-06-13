"use client";

import {
  createContext,
  useCallback,
  useContext,
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
 */
export function TaskInteractionProvider({ children }: { children: ReactNode }) {
  const { editTask, removeTask, setStatus } = useTasksStore();
  const [detailsTask, setDetailsTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const openDetails = useCallback((task: Task) => setDetailsTask(task), []);

  const handleChangeStatus = useCallback(
    (taskId: string, status: TaskStatus) => {
      // Keep the open modal in sync with the optimistic change.
      setDetailsTask((t) => (t && t.id === taskId ? { ...t, status } : t));
      void setStatus(taskId, status);
    },
    [setStatus]
  );

  const handleDelete = useCallback(
    (taskId: string) => {
      if (!window.confirm("هل تريد حذف هذه المهمة؟")) return;
      setDetailsTask(null);
      void removeTask(taskId);
    },
    [removeTask]
  );

  const handleEdit = useCallback((task: Task) => {
    setDetailsTask(null);
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
        onClose={() => setDetailsTask(null)}
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
