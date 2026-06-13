"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from "@/services/task.service";
import type { Task, TaskInput, TaskUpdateInput } from "@/types/task";

interface TasksContextValue {
  tasks: Task[];
  error: string | null;
  addTask: (input: TaskInput) => Promise<Task | null>;
  editTask: (taskId: string, input: TaskUpdateInput) => Promise<Task | null>;
  removeTask: (taskId: string) => Promise<void>;
  setStatus: (taskId: string, status: Task["status"]) => Promise<Task | null>;
  togglePin: (taskId: string, currentlyPinned: boolean) => Promise<Task | null>;
  /** Re-fetch the canonical list from Supabase (background revalidation). */
  refresh: () => Promise<void>;
}

const TasksContext = createContext<TasksContextValue | null>(null);

/**
 * Shared client-side cache for the current user's tasks.
 *
 * Seeded once from the server (in the persistent dashboard layout) and kept in
 * memory across dashboard ↔ tasks navigation, so those routes render instantly
 * from the store instead of re-fetching on every navigation. Every mutation is
 * optimistic and goes through the task service (RLS-protected), keeping all
 * consumers — dashboard sections and the task list — in sync without a server
 * round-trip or `router.refresh()`.
 */
export function TasksProvider({
  userId,
  initialTasks,
  children,
}: {
  userId: string;
  initialTasks: Task[];
  children: ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [error, setError] = useState<string | null>(null);

  const addTask = useCallback(
    async (input: TaskInput) => {
      setError(null);
      try {
        const task = await createTask(supabase, userId, input);
        setTasks((current) => [task, ...current]);
        return task;
      } catch {
        setError("تعذّر إضافة المهمة");
        return null;
      }
    },
    [supabase, userId]
  );

  const editTask = useCallback(
    async (taskId: string, input: TaskUpdateInput) => {
      setError(null);
      let previous: Task[] = [];
      setTasks((current) => {
        previous = current;
        return current.map((task) =>
          task.id === taskId ? { ...task, ...input } : task
        );
      });
      try {
        const updated = await updateTask(supabase, taskId, input);
        setTasks((current) =>
          current.map((task) => (task.id === taskId ? updated : task))
        );
        return updated;
      } catch {
        setTasks(previous);
        setError("تعذّر تحديث المهمة");
        return null;
      }
    },
    [supabase]
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      setError(null);
      let previous: Task[] = [];
      setTasks((current) => {
        previous = current;
        return current.filter((task) => task.id !== taskId);
      });
      try {
        await deleteTask(supabase, taskId);
      } catch {
        setTasks(previous);
        setError("تعذّر حذف المهمة");
      }
    },
    [supabase]
  );

  const setStatus = useCallback(
    (taskId: string, status: Task["status"]) => editTask(taskId, { status }),
    [editTask]
  );

  const togglePin = useCallback(
    (taskId: string, currentlyPinned: boolean) =>
      editTask(taskId, { is_pinned: !currentlyPinned }),
    [editTask]
  );

  const refresh = useCallback(async () => {
    try {
      const fresh = await fetchTasks(supabase);
      setTasks(fresh);
    } catch {
      setError("تعذّر تحديث المهام");
    }
  }, [supabase]);

  const value = useMemo(
    () => ({
      tasks,
      error,
      addTask,
      editTask,
      removeTask,
      setStatus,
      togglePin,
      refresh,
    }),
    [tasks, error, addTask, editTask, removeTask, setStatus, togglePin, refresh]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasksStore(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error("useTasksStore must be used within a TasksProvider");
  }
  return ctx;
}
