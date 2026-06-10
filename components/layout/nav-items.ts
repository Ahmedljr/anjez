import {
  Home,
  ListChecks,
  Target,
  Lightbulb,
  Trophy,
  BarChart3,
  Calendar,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Whether the module is fully implemented. Unfinished ones show a "قريباً" badge. */
  ready: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "لوحة القيادة", icon: Home, ready: true },
  { href: "/tasks", label: "المهام", icon: ListChecks, ready: true },
  { href: "/goals", label: "الأهداف", icon: Target, ready: false },
  { href: "/ideas", label: "الأفكار", icon: Lightbulb, ready: false },
  { href: "/achievements", label: "الإنجازات", icon: Trophy, ready: false },
  { href: "/reports", label: "التقارير", icon: BarChart3, ready: false },
  { href: "/calendar", label: "التقويم", icon: Calendar, ready: false },
  { href: "/settings", label: "الإعدادات", icon: Settings, ready: false },
];
