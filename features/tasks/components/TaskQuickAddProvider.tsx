"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useTasksStore } from "./TasksProvider";
import { TaskFormModal } from "./TaskFormModal";

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

/**
 * Owns a single shared instance of the task creation modal so the floating
 * action button (and any future caller) can open it. Creation goes through the
 * shared tasks store (optimistic, no server round-trip on navigation).
 */
export function TaskQuickAddProvider({ children }: { children: ReactNode }) {
  const { addTask } = useTasksStore();
  const [open, setOpen] = useState(false);

  return (
    <QuickAddContext.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <TaskFormModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={addTask}
      />
    </QuickAddContext.Provider>
  );
}
