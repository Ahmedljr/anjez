"use client";

import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
import { TaskQuickAddProvider } from "@/features/tasks/components/TaskQuickAddProvider";
import { TaskInteractionProvider } from "@/features/tasks/components/TaskInteractionProvider";
import { FloatingActionButton } from "@/features/tasks/components/FloatingActionButton";
import { SidebarNav } from "./SidebarNav";

interface AppShellProps {
  userId: string;
  children: ReactNode;
}

export function AppShell({ userId, children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <TaskQuickAddProvider userId={userId}>
      <TaskInteractionProvider>
      <div className="min-h-dvh bg-slate-50">
        {/* Desktop sidebar — fixed on the right (RTL) */}
        <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 flex-col border-l border-slate-100 bg-white px-4 py-5 lg:flex">
          <span className="mb-6 px-1 text-xl font-bold text-primary-700">أنجز</span>
          <SidebarNav />
          <div className="mt-auto px-1">
            <SignOutButton />
          </div>
        </aside>

        {/* Mobile top bar with hamburger */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="فتح القائمة"
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-lg font-bold text-primary-700">أنجز</span>
          <SignOutButton />
        </header>

        {/* Mobile drawer overlay */}
        <div
          onClick={() => setDrawerOpen(false)}
          className={cn(
            "fixed inset-0 z-40 bg-slate-900/40 transition-opacity lg:hidden",
            drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        />

        {/* Mobile slide-out drawer (from the right, RTL) */}
        <aside
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-72 max-w-[80%] flex-col bg-white px-4 py-5 shadow-xl transition-transform duration-300 lg:hidden",
            drawerOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="mb-6 flex items-center justify-between px-1">
            <span className="text-xl font-bold text-primary-700">أنجز</span>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="إغلاق القائمة"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <SidebarNav onNavigate={() => setDrawerOpen(false)} />
          <div className="mt-auto px-1">
            <SignOutButton />
          </div>
        </aside>

        {/* Main content */}
        <main className="mx-auto w-full max-w-lg px-4 pb-28 pt-6 lg:mx-0 lg:max-w-none lg:mr-64 lg:px-10 lg:pt-10">
          {children}
        </main>

        <FloatingActionButton />
      </div>
      </TaskInteractionProvider>
    </TaskQuickAddProvider>
  );
}
