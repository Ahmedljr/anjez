"use client";

import { useEffect, useState } from "react";
import { getGreeting, type GreetingResult } from "@/features/dashboard/lib/greeting";

interface HeroSectionProps {
  name: string;
}

export function HeroSection({ name }: HeroSectionProps) {
  const [greeting, setGreeting] = useState<GreetingResult>({ text: "أهلاً بك", emoji: "✨" });

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 px-5 py-6 text-white">
      <p className="text-2xl font-bold leading-snug">
        {greeting.text}، {name} {greeting.emoji}
      </p>
      <p className="mt-1.5 text-sm text-primary-100">خل نركز على المهم اليوم</p>
    </div>
  );
}
