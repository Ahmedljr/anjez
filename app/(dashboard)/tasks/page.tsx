import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { fetchTasks } from "@/services/task.service";
import { TaskList, type TaskListFilter } from "@/features/tasks";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const supabase = await createClient();
  // Run auth, the task query and the search params concurrently.
  const [user, tasks, { filter }] = await Promise.all([
    getCurrentUser(),
    fetchTasks(supabase),
    searchParams,
  ]);

  if (!user) redirect("/login");

  const activeFilter: TaskListFilter =
    filter === "completed" || filter === "overdue" ? filter : "active";

  const headings: Record<TaskListFilter, string> = {
    active: "كل مهامك في مكان واحد، مرتبة حسب أولويتها",
    completed: "أرشيف إنجازاتك — كل ما أكملته من مهام",
    overdue: "المهام التي تجاوزت موعد استحقاقها",
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">المهام</h1>
        <p className="mt-1 text-sm text-slate-500">{headings[activeFilter]}</p>
      </div>

      <TaskList userId={user.id} initialTasks={tasks} filter={activeFilter} />
    </div>
  );
}
