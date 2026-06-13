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
import {
  createSubtask,
  deleteSubtask,
  updateSubtask,
} from "@/services/subtask.service";
import type { Task, TaskInput, TaskUpdateInput } from "@/types/task";
import type { Subtask } from "@/types/subtask";

type SubtasksByTask = Record<string, Subtask[]>;

interface TasksContextValue {
  tasks: Task[];
  /** The current user's subtasks, grouped by `task_id`. */
  subtasks: SubtasksByTask;
  error: string | null;
  addTask: (input: TaskInput) => Promise<Task | null>;
  editTask: (taskId: string, input: TaskUpdateInput) => Promise<Task | null>;
  removeTask: (taskId: string) => Promise<void>;
  setStatus: (taskId: string, status: Task["status"]) => Promise<Task | null>;
  togglePin: (taskId: string, currentlyPinned: boolean) => Promise<Task | null>;
  addSubtask: (taskId: string, title: string) => Promise<Subtask | null>;
  toggleSubtask: (
    taskId: string,
    subtaskId: string,
    isDone: boolean
  ) => Promise<void>;
  removeSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  /** Re-fetch the canonical list from Supabase (background revalidation). */
  refresh: () => Promise<void>;
}

const TasksContext = createContext<TasksContextValue | null>(null);

function groupByTask(list: Subtask[]): SubtasksByTask {
  const map: SubtasksByTask = {};
  for (const s of list) (map[s.task_id] ??= []).push(s);
  return map;
}

/**
 * Shared client-side cache for the current user's tasks **and subtasks**.
 *
 * Both are seeded once from the server (in the persistent dashboard layout) and
 * kept in memory across navigation, so routes render instantly from the store
 * instead of re-fetching. Every mutation is optimistic and goes through the
 * services (RLS-protected), keeping all consumers in sync without a server
 * round-trip or `router.refresh()`.
 */
export function TasksProvider({
  userId,
  initialTasks,
  initialSubtasks,
  children,
}: {
  userId: string;
  initialTasks: Task[];
  initialSubtasks: Subtask[];
  children: ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [subtasks, setSubtasks] = useState<SubtasksByTask>(() =>
    groupByTask(initialSubtasks)
  );
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
      // Subtasks are cascade-deleted in the DB; drop them from the store too.
      setSubtasks((current) => {
        if (!current[taskId]) return current;
        const next = { ...current };
        delete next[taskId];
        return next;
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

  const addSubtask = useCallback(
    async (taskId: string, title: string) => {
      setError(null);
      const now = new Date().toISOString();
      const tempId = crypto.randomUUID();
      const optimistic: Subtask = {
        id: tempId,
        task_id: taskId,
        user_id: userId,
        title,
        is_done: false,
        created_at: now,
        updated_at: now,
      };
      setSubtasks((current) => ({
        ...current,
        [taskId]: [...(current[taskId] ?? []), optimistic],
      }));
      try {
        const real = await createSubtask(supabase, userId, taskId, title);
        setSubtasks((current) => ({
          ...current,
          [taskId]: (current[taskId] ?? []).map((s) =>
            s.id === tempId ? real : s
          ),
        }));
        return real;
      } catch {
        setSubtasks((current) => ({
          ...current,
          [taskId]: (current[taskId] ?? []).filter((s) => s.id !== tempId),
        }));
        setError("تعذّر إضافة المهمة الفرعية");
        return null;
      }
    },
    [supabase, userId]
  );

  const toggleSubtask = useCallback(
    async (taskId: string, subtaskId: string, isDone: boolean) => {
      setError(null);
      const apply = (done: boolean) =>
        setSubtasks((current) => ({
          ...current,
          [taskId]: (current[taskId] ?? []).map((s) =>
            s.id === subtaskId ? { ...s, is_done: done } : s
          ),
        }));
      apply(isDone);
      try {
        await updateSubtask(supabase, subtaskId, { is_done: isDone });
      } catch {
        apply(!isDone);
        setError("تعذّر تحديث المهمة الفرعية");
      }
    },
    [supabase]
  );

  const removeSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      setError(null);
      let previous: Subtask[] = [];
      setSubtasks((current) => {
        previous = current[taskId] ?? [];
        return { ...current, [taskId]: previous.filter((s) => s.id !== subtaskId) };
      });
      try {
        await deleteSubtask(supabase, subtaskId);
      } catch {
        setSubtasks((current) => ({ ...current, [taskId]: previous }));
        setError("تعذّر حذف المهمة الفرعية");
      }
    },
    [supabase]
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
      subtasks,
      error,
      addTask,
      editTask,
      removeTask,
      setStatus,
      togglePin,
      addSubtask,
      toggleSubtask,
      removeSubtask,
      refresh,
    }),
    [
      tasks,
      subtasks,
      error,
      addTask,
      editTask,
      removeTask,
      setStatus,
      togglePin,
      addSubtask,
      toggleSubtask,
      removeSubtask,
      refresh,
    ]
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
