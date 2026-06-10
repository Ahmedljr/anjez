import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui";

export function ProductivityInsightSection() {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-slate-700">💎 معلومة اليوم</h2>
      <Card className="border-primary-100 bg-gradient-to-br from-primary-50 to-white">
        <p className="text-sm leading-relaxed text-slate-700">
          إذا أنجزت أهم 20% من مهامك اليوم، غالباً ستحقق 80% من نتائجك.
        </p>
        <Link
          href="/reports"
          className="mt-3 flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
        >
          عرض التقارير
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
      </Card>
    </section>
  );
}
