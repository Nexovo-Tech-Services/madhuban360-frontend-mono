import type { UserRole } from "@madhuban/types";

export type AppRoleKey = "supervisor" | "manager" | "staff";

function normalizeRole(role: UserRole | string | undefined): string {
  return String(role ?? "staff").trim().toLowerCase();
}

export function getRoleRouteKey(role: UserRole | string | undefined): AppRoleKey {
  const normalized = normalizeRole(role);

  if (normalized === "supervisor") return "supervisor";
  if (normalized === "manager") return "manager";
  return "staff";
}

export function getRoleHomePath(role: UserRole | string | undefined): `/${AppRoleKey}/home` {
  return `/${getRoleRouteKey(role)}/home`;
}

export function isRoleAllowed(
  role: UserRole | string | undefined,
  allowedRoles: Array<UserRole | string>,
): boolean {
  const normalized = normalizeRole(role);
  return allowedRoles.some((item) => normalizeRole(item) === normalized);
}
