import { RoleRouteGuard } from "../../src/navigation/RoleRouteGuard";

export default function StaffLayout() {
  return <RoleRouteGuard allowedRoles={["staff", "guard", "admin"]} />;
}
