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
import {
  createChecklistItem,
  deleteChecklistItem,
  updateChecklistItem,
} from "@/services/checklist.service";
import type { Task, TaskInput, TaskStatus, TaskUpdateInput } from "@/types/task";
import type { Subtask } from "@/types/subtask";
import type { ChecklistItem } from "@/types/checklist";

type SubtasksByTask = Record<string, Subtask[]>;
type ChecklistByTask = Record<string, ChecklistItem[]>;

interface TasksContextValue {
  tasks: Task[];
  /** The current user's subtasks (real mini-tasks), grouped by `task_id`. */
  subtasks: SubtasksByTask;
  /** The current user's checklist items (lightweight), grouped by `task_id`. */
  checklist: ChecklistByTask;
  error: string | null;
  addTask: (input: TaskInput) => Promise<Task | null>;
  editTask: (taskId: string, input: TaskUpdateInput) => Promise<Task | null>;
  removeTask: (taskId: string) => Promise<void>;
  setStatus: (taskId: string, status: TaskStatus) => Promise<Task | null>;
  togglePin: (taskId: string, currentlyPinned: boolean) => Promise<Task | null>;
  // Subtasks (status-driven)
  addSubtask: (taskId: string, title: string) => Promise<Subtask | null>;
  setSubtaskStatus: (
    taskId: string,
    subtaskId: string,
    status: TaskStatus
  ) => Promise<void>;
  removeSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  // Checklist items (lightweight)
  addChecklistItem: (taskId: string, title: string) => Promise<ChecklistItem | null>;
  toggleChecklistItem: (
    taskId: string,
    itemId: string,
    isChecked: boolean
  ) => Promise<void>;
  removeChecklistItem: (taskId: string, itemId: string) => Promise<void>;
  /** Re-fetch the canonical task list from Supabase (background revalidation). */
  refresh: () => Promise<void>;
}

const TasksContext = createContext<TasksContextValue | null>(null);

function groupByTask<T extends { task_id: string }>(
  list: T[]
): Record<string, T[]> {
  const map: Record<string, T[]> = {};
  for (const item of list) (map[item.task_id] ??= []).push(item);
  return map;
}

/**
 * Shared client-side cache for the current user's tasks, **subtasks** and
 * **checklist items**. All three are seeded once from the server (in the
 * persistent dashboard layout) and kept in memory across navigation, so routes
 * render instantly from the store. Every mutation is optimistic and goes
 * through the services (RLS-protected) — no server round-trip or
 * `router.refresh()`.
 */
export function TasksProvider({
  userId,
  initialTasks,
  initialSubtasks,
  initialChecklist,
  children,
}: {
  userId: string;
  initialTasks: Task[];
  initialSubtasks: Subtask[];
  initialChecklist: ChecklistItem[];
  children: ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [subtasks, setSubtasks] = useState<SubtasksByTask>(() =>
    groupByTask(initialSubtasks)
  );
  const [checklist, setChecklist] = useState<ChecklistByTask>(() =>
    groupByTask(initialChecklist)
  );
  const [error, setError] = useState<string | null>(null);

  const addTask = useCallback(
    async (input: TaskInput) => {
      setError(null);
      try {
        const task = await createTask(supabase, userId, input);
        setTasks((current) => [task, ...current]);
        // Register the new task in the relational maps with empty arrays, so its
        // store shape is identical to a hydrated task (a task that has children
        // gets a key from groupByTask) — instead of relying solely on read-time
        // `?? []`. This keeps checklist/subtasks/progress consistent everywhere.
        setSubtasks((current) =>
          current[task.id] ? current : { ...current, [task.id]: [] }
        );
        setChecklist((current) =>
          current[task.id] ? current : { ...current, [task.id]: [] }
        );
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
      // Subtasks + checklist are cascade-deleted in the DB; drop them locally.
      const drop = <T,>(current: Record<string, T>) => {
        if (!current[taskId]) return current;
        const next = { ...current };
        delete next[taskId];
        return next;
      };
      setSubtasks(drop);
      setChecklist(drop);
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
    (taskId: string, status: TaskStatus) => editTask(taskId, { status }),
    [editTask]
  );

  const togglePin = useCallback(
    (taskId: string, currentlyPinned: boolean) =>
      editTask(taskId, { is_pinned: !currentlyPinned }),
    [editTask]
  );

  // --- Subtasks -----------------------------------------------------------
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
        status: "todo",
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

  const setSubtaskStatus = useCallback(
    async (taskId: string, subtaskId: string, status: TaskStatus) => {
      setError(null);
      let previousStatus: TaskStatus = "todo";
      setSubtasks((current) => ({
        ...current,
        [taskId]: (current[taskId] ?? []).map((s) => {
          if (s.id !== subtaskId) return s;
          previousStatus = s.status;
          return { ...s, status };
        }),
      }));
      try {
        await updateSubtask(supabase, subtaskId, { status });
      } catch {
        setSubtasks((current) => ({
          ...current,
          [taskId]: (current[taskId] ?? []).map((s) =>
            s.id === subtaskId ? { ...s, status: previousStatus } : s
          ),
        }));
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

  // --- Checklist items ----------------------------------------------------
  const addChecklistItem = useCallback(
    async (taskId: string, title: string) => {
      setError(null);
      const now = new Date().toISOString();
      const tempId = crypto.randomUUID();
      const optimistic: ChecklistItem = {
        id: tempId,
        task_id: taskId,
        user_id: userId,
        title,
        is_checked: false,
        created_at: now,
        updated_at: now,
      };
      setChecklist((current) => ({
        ...current,
        [taskId]: [...(current[taskId] ?? []), optimistic],
      }));
      try {
        const real = await createChecklistItem(supabase, userId, taskId, title);
        setChecklist((current) => ({
          ...current,
          [taskId]: (current[taskId] ?? []).map((i) =>
            i.id === tempId ? real : i
          ),
        }));
        return real;
      } catch {
        setChecklist((current) => ({
          ...current,
          [taskId]: (current[taskId] ?? []).filter((i) => i.id !== tempId),
        }));
        setError("تعذّر إضافة عنصر القائمة");
        return null;
      }
    },
    [supabase, userId]
  );

  const toggleChecklistItem = useCallback(
    async (taskId: string, itemId: string, isChecked: boolean) => {
      setError(null);
      const apply = (checked: boolean) =>
        setChecklist((current) => ({
          ...current,
          [taskId]: (current[taskId] ?? []).map((i) =>
            i.id === itemId ? { ...i, is_checked: checked } : i
          ),
        }));
      apply(isChecked);
      try {
        await updateChecklistItem(supabase, itemId, { is_checked: isChecked });
      } catch {
        apply(!isChecked);
        setError("تعذّر تحديث عنصر القائمة");
      }
    },
    [supabase]
  );

  const removeChecklistItem = useCallback(
    async (taskId: string, itemId: string) => {
      setError(null);
      let previous: ChecklistItem[] = [];
      setChecklist((current) => {
        previous = current[taskId] ?? [];
        return { ...current, [taskId]: previous.filter((i) => i.id !== itemId) };
      });
      try {
        await deleteChecklistItem(supabase, itemId);
      } catch {
        setChecklist((current) => ({ ...current, [taskId]: previous }));
        setError("تعذّر حذف عنصر القائمة");
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
      checklist,
      error,
      addTask,
      editTask,
      removeTask,
      setStatus,
      togglePin,
      addSubtask,
      setSubtaskStatus,
      removeSubtask,
      addChecklistItem,
      toggleChecklistItem,
      removeChecklistItem,
      refresh,
    }),
    [
      tasks,
      subtasks,
      checklist,
      error,
      addTask,
      editTask,
      removeTask,
      setStatus,
      togglePin,
      addSubtask,
      setSubtaskStatus,
      removeSubtask,
      addChecklistItem,
      toggleChecklistItem,
      removeChecklistItem,
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
