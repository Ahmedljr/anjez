"use client";

import Link from "next/link";
import { Pin, Sparkles, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, Card, EmptyState } from "@/components/ui";
import { useTaskInteraction } from "@/features/tasks/components/TaskInteractionProvider";
import { IMPACT_BADGE_TONE, IMPACT_LABELS } from "@/features/tasks/lib/labels";
import type { Task } from "@/types/task";

/** Due dates are formatted on the server so this client component doesn't ship
 * the date-fns Arabic locale to the browser. */
export interface PriorityItem {
  task: Task;
  dueLabel: string | null;
}

interface TopPrioritiesSectionProps {
  items: PriorityItem[];
}

export function TopPrioritiesSection({ items }: TopPrioritiesSectionProps) {
  const { openDetails } = useTaskInteraction();

  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-slate-700">🎯 أهم المهام اليوم</h2>

      {items.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-9 w-9" />}
          title="لا توجد مهام نشطة"
          description="أضف مهمة من صفحة المهام لتبدأ يومك"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(({ task, dueLabel }, index) => (
            <Card
              key={task.id}
              onClick={() => openDetails(task)}
              className={cn(
                "flex cursor-pointer items-start justify-between gap-3 transition-colors hover:border-slate-200",
                index === 0
                  ? "border-primary-200 bg-primary-50 ring-1 ring-primary-200 hover:bg-primary-100/70"
                  : "hover:bg-slate-50/60"
              )}
            >
              <div className="min-w-0 flex-1">
                {index === 0 && (
                  <span className="mb-1.5 inline-block text-xs font-semibold text-primary-600">
                    ⭐ الأولى بالتنفيذ
                  </span>
                )}
                <p
                  className={cn(
                    "font-medium text-slate-900",
                    index === 0 && "text-base"
                  )}
                >
                  {task.title}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge tone={IMPACT_BADGE_TONE[task.impact_level]}>
                    {IMPACT_LABELS[task.impact_level]}
                  </Badge>
                  {dueLabel && <Badge tone="blue">{dueLabel}</Badge>}
                </div>
              </div>
              {task.is_pinned && (
                <Pin className="h-4 w-4 shrink-0 fill-primary-500 text-primary-500" />
              )}
            </Card>
          ))}

          <button
            type="button"
            onClick={() => openDetails(items[0].task)}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:bg-primary-800"
          >
            ابدأ بالمهمة الأولى
            <ArrowLeft className="h-4 w-4" />
          </button>

          <Link
            href="/tasks"
            className="text-center text-sm text-primary-600 hover:underline"
          >
            عرض كل المهام
          </Link>
        </div>
      )}
    </section>
  );
}
