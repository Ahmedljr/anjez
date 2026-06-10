"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button, Input } from "@/components/ui";
import type { TaskInput } from "@/types/task";

interface QuickAddTaskProps {
  onAdd: (input: TaskInput) => Promise<unknown>;
}

/** Fast single-field capture — defaults the rest so adding a task takes one tap. */
export function QuickAddTask({ onAdd }: QuickAddTaskProps) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      await onAdd({ title: trimmed, impact_level: "medium" });
      setTitle("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="أضف مهمة جديدة بسرعة..."
        aria-label="عنوان المهمة"
      />
      <Button type="submit" disabled={submitting || !title.trim()} aria-label="إضافة">
        <Plus className="h-5 w-5" />
      </Button>
    </form>
  );
}
