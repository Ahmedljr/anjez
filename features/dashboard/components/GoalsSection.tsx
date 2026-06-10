import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui";

interface Goal {
  id: string;
  name: string;
  progress: number;
}

const MOCK_GOALS: Goal[] = [
  { id: "1", name: "إكمال مشروع أنجز", progress: 45 },
  { id: "2", name: "قراءة 12 كتاباً هذا العام", progress: 25 },
  { id: "3", name: "تحسين مهارات البرمجة", progress: 60 },
];

export function GoalsSection() {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-700">🏆 أهدافك</h2>
        <Link
          href="/goals"
          className="flex items-center gap-1 text-sm text-primary-600 hover:underline"
        >
          عرض الكل
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {MOCK_GOALS.map((goal) => (
          <Card key={goal.id} className="py-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-800">{goal.name}</p>
              <span className="text-xs font-semibold text-primary-600">
                {goal.progress}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary-500 transition-all"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-slate-400">
        قريباً — ربط بأهداف حقيقية
      </p>
    </section>
  );
}
