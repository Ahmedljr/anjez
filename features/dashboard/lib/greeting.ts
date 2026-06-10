export interface GreetingResult {
  text: string;
  emoji: string;
}

/** Returns an Arabic greeting and emoji based on the time of day. */
export function getGreeting(date: Date = new Date()): GreetingResult {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return { text: "صباح الخير", emoji: "☀️" };
  if (hour >= 12 && hour < 18) return { text: "أهلاً بك", emoji: "🌤️" };
  return { text: "مساء الخير", emoji: "🌙" };
}
