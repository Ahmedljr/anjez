import { TaskList, type TaskListFilter } from "@/features/tasks";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  // The URL provides the INITIAL filter (deep-links like ?filter=overdue from
  // the dashboard). After that, switching tabs is pure client state — no
  // navigation. Auth is enforced by middleware + the dashboard layout; task
  // data comes from the shared client store.
  const { filter } = await searchParams;
  const initialFilter: TaskListFilter =
    filter === "completed" || filter === "overdue" ? filter : "active";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <TaskList initialFilter={initialFilter} />
    </div>
  );
}
