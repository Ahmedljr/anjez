"use client";

import { Plus } from "lucide-react";
import { useQuickAdd } from "./TaskQuickAddProvider";

/**
 * Always-visible shortcut to capture a new task. Sits bottom-right on mobile
 * and clears the desktop sidebar so it never overlaps the navigation.
 */
export function FloatingActionButton() {
  const { open } = useQuickAdd();

  return (
    <button
      type="button"
      onClick={open}
      aria-label="إضافة مهمة جديدة"
      className="fixed bottom-6 right-5 z-40 flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 transition-transform hover:scale-105 hover:bg-primary-700 active:scale-95 lg:bottom-8 lg:right-[calc(16rem+1.5rem)]"
    >
      <Plus className="h-5 w-5" />
      <span>مهمة جديدة</span>
    </button>
  );
}
