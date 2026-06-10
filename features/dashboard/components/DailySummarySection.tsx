import Link from "next/link";
import { Card } from "@/components/ui";

interface DailySummarySectionProps {
  total: number;
  completed: number;
  remaining: number;
}

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <Card className="flex flex-col items-center justify-center py-4 text-center">
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="mt-1 text-xs text-slate-500">{label}</span>
    </Card>
  );
}

export function DailySummarySection({
  total,
  completed,
  remaining,
}: DailySummarySectionProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-700">📊 ملخص اليوم</h2>
        <Link href="/tasks" className="text-sm text-primary-600 hover:underline">
          عرض الكل
        </Link>
      </div>
      <Link href="/tasks" className="block">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="إجمالي المهام" value={total} color="text-slate-700" />
          <StatCard label="مكتملة" value={completed} color="text-emerald-600" />
          <StatCard label="متبقية" value={remaining} color="text-primary-600" />
          <StatCard
            label="نسبة الإنجاز"
            value={`${percentage}%`}
            color="text-amber-600"
          />
        </div>
      </Link>
    </section>
  );
}
