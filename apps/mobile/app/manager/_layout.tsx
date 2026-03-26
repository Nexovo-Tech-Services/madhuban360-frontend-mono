import { RoleRouteGuard } from "../../src/navigation/RoleRouteGuard";

export default function ManagerLayout() {
  return <RoleRouteGuard allowedRoles={["manager"]} />;
}
