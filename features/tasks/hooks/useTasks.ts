"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createTask,
  deleteTask,
  updateTask,
} from "@/services/task.service";
import type { Task, TaskInput, TaskUpdateInput } from "@/types/task";

interface UseTasksOptions {
  userId: string;
  initialTasks: Task[];
}

/**
 * Owns the task list state for the current user and wraps every mutation
 * with the matching Supabase service call, keeping components declarative.
 */
export function useTasks({ userId, initialTasks }: UseTasksOptions) {
  const supabase = useMemo(() => createClient(), []);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [error, setError] = useState<string | null>(null);

  // Re-sync when the server sends a fresh list (e.g. after a task is created
  // from the global floating action button, which triggers router.refresh()).
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

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
      const previous = tasks;
      setTasks((current) =>
        current.map((task) => (task.id === taskId ? { ...task, ...input } : task))
      );
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
    [supabase, tasks]
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      setError(null);
      const previous = tasks;
      setTasks((current) => current.filter((task) => task.id !== taskId));
      try {
        await deleteTask(supabase, taskId);
      } catch {
        setTasks(previous);
        setError("تعذّر حذف المهمة");
      }
    },
    [supabase, tasks]
  );

  const setStatus = useCallback(
    (taskId: string, status: Task["status"]) => {
      return editTask(taskId, { status });
    },
    [editTask]
  );

  const togglePin = useCallback(
    (taskId: string, currentlyPinned: boolean) => {
      return editTask(taskId, { is_pinned: !currentlyPinned });
    },
    [editTask]
  );

  return { tasks, error, addTask, editTask, removeTask, setStatus, togglePin };
}
