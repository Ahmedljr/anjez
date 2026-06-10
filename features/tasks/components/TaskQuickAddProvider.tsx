"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createTask } from "@/services/task.service";
import { TaskFormModal } from "./TaskFormModal";
import type { TaskInput } from "@/types/task";

interface QuickAddContextValue {
  open: () => void;
}

const QuickAddContext = createContext<QuickAddContextValue | null>(null);

/** Trigger the global "new task" modal from anywhere inside the app shell. */
export function useQuickAdd(): QuickAddContextValue {
  const ctx = useContext(QuickAddContext);
  if (!ctx) {
    throw new Error("useQuickAdd must be used within a TaskQuickAddProvider");
  }
  return ctx;
}

interface TaskQuickAddProviderProps {
  userId: string;
  children: ReactNode;
}

/**
 * Owns a single shared instance of the task creation modal so the floating
 * action button (and any future caller) can open it without duplicating the
 * form. Creation goes through the existing task service; a router refresh keeps
 * server components in sync afterwards.
 */
export function TaskQuickAddProvider({
  userId,
  children,
}: TaskQuickAddProviderProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);

  async function handleCreate(input: TaskInput) {
    await createTask(supabase, userId, input);
    router.refresh();
  }

  return (
    <QuickAddContext.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <TaskFormModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={handleCreate}
      />
    </QuickAddContext.Provider>
  );
}
