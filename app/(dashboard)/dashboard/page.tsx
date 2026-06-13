import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getDisplayName } from "@/features/dashboard/lib/display-name";
import { DashboardView } from "@/features/dashboard/components/DashboardView";

export default async function DashboardPage() {
  // Identity comes from the middleware-set header (no Supabase round-trip);
  // task data comes from the shared client store, not a per-route fetch.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <DashboardView name={getDisplayName(user)} />;
}
