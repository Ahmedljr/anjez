import { Hammer } from "lucide-react";

interface UnderConstructionProps {
  title: string;
}

/** Shared placeholder for modules that are routed but not yet implemented. */
export function UnderConstruction({ title }: UnderConstructionProps) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-500">
          <Hammer className="h-7 w-7" />
        </div>
        <p className="text-lg font-semibold text-slate-700">قيد التطوير</p>
        <p className="max-w-xs text-sm text-slate-500">
          نعمل على هذه الميزة وستكون متاحة قريباً ضمن تحديثات أنجز القادمة.
        </p>
      </div>
    </div>
  );
}
