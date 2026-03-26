import { RoleRouteGuard } from "../../src/navigation/RoleRouteGuard";

export default function SupervisorLayout() {
  return <RoleRouteGuard allowedRoles={["supervisor"]} />;
}
