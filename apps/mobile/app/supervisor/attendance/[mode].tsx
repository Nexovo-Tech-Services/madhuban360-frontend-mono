import { useLocalSearchParams } from "expo-router";
import { AttendanceActionScreen } from "../../../src/screens/attendance/AttendanceActionScreen";

export default function SupervisorAttendanceModeRoute() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  return <AttendanceActionScreen mode={mode === "check-out" ? "check-out" : "check-in"} />;
}
