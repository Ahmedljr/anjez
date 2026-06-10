"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_ORDER, STATUS_VISUALS } from "@/features/tasks/lib/labels";
import type { TaskStatus } from "@/types/task";

interface StatusSelectorProps {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  /** "dot" = compact glyph button (for lists). "full" = glyph + label pill. */
  variant?: "dot" | "full";
  className?: string;
}

/**
 * A small popover that lets the user move a task between
 * لم تبدأ / قيد التنفيذ / مكتملة. Each state has a distinct glyph and colour.
 */
export function StatusSelector({
  value,
  onChange,
  variant = "dot",
  className,
}: StatusSelectorProps) {
  const [open, setOpen] = useState(false);
  const current = STATUS_VISUALS[value];

  function select(status: TaskStatus) {
    setOpen(false);
    if (status !== value) onChange(status);
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label={`الحالة: ${current.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          variant === "dot"
            ? cn(
                "flex h-6 w-6 items-center justify-center rounded-full border-2 text-sm leading-none transition-colors",
                current.dotClass
              )
            : cn(
                "inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-colors",
                current.dotClass
              )
        }
      >
        <span aria-hidden>{current.glyph}</span>
        {variant === "full" && <span>{current.label}</span>}
      </button>

      {open && (
        <>
          {/* Click-away backdrop */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            className="absolute z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-lg ltr:left-0 rtl:right-0"
          >
            {STATUS_ORDER.map((status) => {
              const v = STATUS_VISUALS[status];
              const active = status === value;
              return (
                <button
                  key={status}
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation();
                    select(status);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-50",
                    active ? "font-semibold text-slate-900" : "text-slate-600"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border-2 text-xs leading-none",
                      v.dotClass
                    )}
                    aria-hidden
                  >
                    {v.glyph}
                  </span>
                  <span className="flex-1 text-right">{v.label}</span>
                  {active && <Check className="h-4 w-4 text-primary-600" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
