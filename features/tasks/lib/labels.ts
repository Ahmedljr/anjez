import type {
  ImpactLevel,
  TaskStatus,
  TaskRecurrence,
} from "@/types/task";
import type { BadgeTone } from "@/components/ui/Badge";

export const IMPACT_LABELS: Record<ImpactLevel, string> = {
  high: "أولوية عالية",
  medium: "أولوية متوسطة",
  low: "أولوية منخفضة",
};

export const IMPACT_BADGE_TONE: Record<ImpactLevel, BadgeTone> = {
  high: "red",
  medium: "amber",
  low: "slate",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "لم تبدأ",
  in_progress: "قيد التنفيذ",
  done: "مكتملة",
};

export const RECURRENCE_LABELS: Record<TaskRecurrence, string> = {
  none: "بدون تكرار",
  daily: "يومي",
  weekly: "أسبوعي",
  monthly: "شهري",
  yearly: "سنوي",
};

/** Per-status visual config used by the status selector and badges. */
export interface StatusVisual {
  label: string;
  /** A glyph that reads at a glance: ○ ◐ ✓ */
  glyph: string;
  tone: BadgeTone;
  /** Tailwind classes for the status pill/control. */
  dotClass: string;
}

export const STATUS_VISUALS: Record<TaskStatus, StatusVisual> = {
  todo: {
    label: STATUS_LABELS.todo,
    glyph: "○",
    tone: "slate",
    dotClass: "border-slate-300 text-slate-400",
  },
  in_progress: {
    label: STATUS_LABELS.in_progress,
    glyph: "◐",
    tone: "amber",
    dotClass: "border-amber-400 bg-amber-50 text-amber-600",
  },
  done: {
    label: STATUS_LABELS.done,
    glyph: "✓",
    tone: "green",
    dotClass: "border-emerald-500 bg-emerald-500 text-white",
  },
};

export const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "done"];
