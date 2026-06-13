import { TaskList, type TaskListFilter } from "@/features/tasks";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  // Auth is enforced by middleware + the dashboard layout. Task data comes from
  // the shared client store (TasksProvider) — no per-navigation fetch here.
  const { filter } = await searchParams;
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

      <TaskList filter={activeFilter} />
    </div>
  );
}
