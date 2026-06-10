"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  deleteTask,
  updateTask,
} from "@/services/task.service";
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
 * task service and a router refresh keeps server components in sync.
 */
export function TaskInteractionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [detailsTask, setDetailsTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const openDetails = useCallback((task: Task) => setDetailsTask(task), []);

  const handleChangeStatus = useCallback(
    async (taskId: string, status: TaskStatus) => {
      // Optimistically reflect the new status in the open modal.
      setDetailsTask((t) => (t && t.id === taskId ? { ...t, status } : t));
      await updateTask(supabase, taskId, { status });
      router.refresh();
    },
    [supabase, router]
  );

  const handleDelete = useCallback(
    async (taskId: string) => {
      if (!window.confirm("هل تريد حذف هذه المهمة؟")) return;
      setDetailsTask(null);
      await deleteTask(supabase, taskId);
      router.refresh();
    },
    [supabase, router]
  );

  const handleEdit = useCallback((task: Task) => {
    setDetailsTask(null);
    setEditingTask(task);
  }, []);

  const handleUpdate = useCallback(
    async (taskId: string, input: TaskUpdateInput) => {
      await updateTask(supabase, taskId, input);
      router.refresh();
    },
    [supabase, router]
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
