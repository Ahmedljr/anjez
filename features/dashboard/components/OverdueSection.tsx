import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatDayMonthShort } from "@/lib/format-date";
import type { Task } from "@/types/task";

interface OverdueSectionProps {
  tasks: Task[];
}

export function OverdueSection({ tasks }: OverdueSectionProps) {
  if (tasks.length === 0) return null;

  const preview = tasks.slice(0, 3);

  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-slate-700">
        ⚠️ تحتاج انتباه <span className="text-amber-600">({tasks.length})</span>
      </h2>
      <Link
        href="/tasks?filter=overdue"
        className="block rounded-2xl border border-amber-200 bg-amber-50 p-3 transition-colors hover:bg-amber-100/70"
      >
        <div className="flex flex-col gap-2">
          {preview.map((task) => (
            <div key={task.id} className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-slate-800">
                {task.title}
              </p>
              {task.due_date && (
                <Badge tone="amber">
                  {formatDayMonthShort(task.due_date)}
                </Badge>
              )}
            </div>
          ))}
          <div className="mt-1 flex items-center justify-end gap-1 text-xs font-medium text-amber-700">
            {tasks.length > 3
              ? `عرض كل المتأخرة (${tasks.length})`
              : "عرض المتأخرة"}
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
        </div>
      </Link>
    </section>
  );
}
