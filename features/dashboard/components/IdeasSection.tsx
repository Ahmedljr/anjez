import Link from "next/link";
import { Lightbulb, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui";

interface Idea {
  id: string;
  title: string;
  date: string;
}

const MOCK_IDEAS: Idea[] = [
  { id: "1", title: "تطوير ميزة التتبع اليومي", date: "اليوم" },
  { id: "2", title: "فكرة لتحسين تجربة المستخدم", date: "أمس" },
  { id: "3", title: "نظام مكافآت للمهام المنجزة", date: "منذ يومين" },
];

export function IdeasSection() {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-700">💡 أفكارك</h2>
        <Link
          href="/ideas"
          className="flex items-center gap-1 text-sm text-primary-600 hover:underline"
        >
          عرض الكل
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {MOCK_IDEAS.map((idea) => (
          <Card key={idea.id} className="flex items-start gap-3 py-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800">{idea.title}</p>
              <p className="text-xs text-slate-400">{idea.date}</p>
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-slate-400">
        قريباً — ربط بوحدة الأفكار
      </p>
    </section>
  );
}
