import type { UserRole } from "@madhuban/types";

export type TabName = "home" | "tasks" | "reports" | "profile" | "qr";

export interface TabDefinition {
  name: TabName;
  title: string;
}

function normalizeRole(role: UserRole | string | undefined): string {
  return String(role ?? "staff").toLowerCase();
}

/** Shared role navigation uses the same four primary tabs for all dashboard roles. */
export function getTabsForRole(
  role: UserRole | string | undefined,
): TabDefinition[] {
  return [
    { name: "home", title: "Home" },
    { name: "tasks", title: "Tasks" },
    { name: "reports", title: "Reports" },
    { name: "profile", title: "Profile" },
  ];
}

export function showQrTab(role: UserRole | string | undefined): boolean {
  void role;
  return false;
}
