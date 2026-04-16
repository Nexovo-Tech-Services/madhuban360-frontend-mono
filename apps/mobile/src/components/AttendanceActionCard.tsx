import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import {
  getManagerAttendance,
  getStaffAttendance,
  getSupervisorAttendance,
  getTodayAttendance,
} from "@madhuban/api";
import { colors, font, radii, space } from "@madhuban/theme";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { getRoleAttendancePath } from "../navigation/roleRoutes";

const CHECKED_IN_KEY = "@attendance:checked_in";

const CHECK_IN_ACTION = {
  key: "check-in" as const,
  title: "Check In",
  subtitle: "Begin today's shift with selfie + GPS",
  icon: "log-in-outline" as const,
};

const CHECK_OUT_ACTION = {
  key: "check-out" as const,
  title: "Check Out",
  subtitle: "Close shift and capture selfie",
  icon: "log-out-outline" as const,
};

const CHECKED_OUT_ACTION = {
  key: "check-in" as const,
  title: "Checked Out",
  subtitle: "Today's attendance is already completed",
  icon: "checkmark-done-outline" as const,
};

export function AttendanceActionCard({ role }: { role: string | undefined }) {
  const [attendancePhase, setAttendancePhase] = useState<"NOT_CHECKED_IN" | "ACTIVE" | "COMPLETED">(
    "NOT_CHECKED_IN",
  );
  const normalizedRole = String(role ?? "").trim().toLowerCase();
  const isManager = normalizedRole === "manager";
  const isSupervisor = normalizedRole === "supervisor";
  const isStaff = normalizedRole === "staff";

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        try {
          let nextPhase: "NOT_CHECKED_IN" | "ACTIVE" | "COMPLETED" = "NOT_CHECKED_IN";
          if (isManager) {
            const data = await getManagerAttendance();
            nextPhase = data.phase;
          } else if (isSupervisor) {
            const data = await getSupervisorAttendance();
            nextPhase = data.phase;
          } else if (isStaff) {
            const data = await getStaffAttendance();
            nextPhase = data.phase;
          } else {
            const res = await getTodayAttendance();
            const data = (res as { data?: unknown } | null)?.data ?? res;
            const checkedOut = Boolean((data as { checkedOut?: unknown } | null)?.checkedOut);
            const checkedIn = Boolean((data as { checkedIn?: unknown } | null)?.checkedIn);
            nextPhase = checkedOut ? "COMPLETED" : checkedIn ? "ACTIVE" : "NOT_CHECKED_IN";
          }
          if (alive) setAttendancePhase(nextPhase);
          await AsyncStorage.setItem(CHECKED_IN_KEY, nextPhase === "ACTIVE" ? "true" : "false");
        } catch {
          const val = await AsyncStorage.getItem(CHECKED_IN_KEY);
          if (alive) setAttendancePhase(val === "true" ? "ACTIVE" : "NOT_CHECKED_IN");
        }
      })();
      return () => {
        alive = false;
      };
    }, [isManager, isStaff, isSupervisor]),
  );

  const checkedIn = attendancePhase === "ACTIVE";
  const checkedOut = attendancePhase === "COMPLETED";
  const action = checkedOut ? CHECKED_OUT_ACTION : checkedIn ? CHECK_OUT_ACTION : CHECK_IN_ACTION;

  async function handleOpen() {
    if (checkedOut) return;
    router.push(getRoleAttendancePath(role, action.key));
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Ionicons name="swap-horizontal-outline" size={14} color="#4F88FF" />
          <Text style={styles.title}>Attendance</Text>
        </View>

        <View
          style={[
            styles.statusPill,
            checkedOut
              ? styles.statusPillCompleted
              : checkedIn
                ? styles.statusPillActive
                : styles.statusPillIdle,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              checkedOut
                ? styles.statusDotCompleted
                : checkedIn
                  ? styles.statusDotActive
                  : styles.statusDotIdle,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              checkedOut
                ? styles.statusTextCompleted
                : checkedIn
                  ? styles.statusTextActive
                  : styles.statusTextIdle,
            ]}
          >
            {checkedOut ? "Checked Out" : checkedIn ? "Checked In" : "Not Checked In"}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.actionRow,
          checkedOut
            ? styles.actionRowCompleted
            : checkedIn
              ? styles.actionRowCheckOut
              : null,
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            checkedOut
              ? styles.iconWrapCompleted
              : checkedIn
                ? styles.iconWrapCheckOut
                : null,
          ]}
        >
          <Ionicons
            name={action.icon}
            size={18}
            color={checkedOut ? "#0F9F6E" : checkedIn ? "#FF6B35" : "#2E6CFF"}
          />
        </View>

        <View style={styles.actionBody}>
          <Text style={styles.actionTitle}>{action.title}</Text>
          <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
        </View>

        <Pressable
          style={[
            styles.button,
            checkedOut ? styles.buttonDisabled : checkedIn ? styles.buttonCheckOut : null,
          ]}
          onPress={handleOpen}
          disabled={checkedOut}
        >
          <Text style={styles.buttonText}>{checkedOut ? "Done" : "Open"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "rgba(34, 50, 72, 0.10)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 4,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: "#28344B",
    fontFamily: font.family.bold,
    fontSize: 14,
    lineHeight: 18,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusPillIdle: {
    backgroundColor: "#F1F3F7",
  },
  statusPillActive: {
    backgroundColor: "#E9FBF2",
  },
  statusPillCompleted: {
    backgroundColor: "#ECFDF3",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
  },
  statusDotIdle: {
    backgroundColor: "#94A3B8",
  },
  statusDotActive: {
    backgroundColor: "#10B981",
  },
  statusDotCompleted: {
    backgroundColor: "#0F9F6E",
  },
  statusText: {
    fontFamily: font.family.bold,
    fontSize: 11,
  },
  statusTextIdle: {
    color: "#64748B",
  },
  statusTextActive: {
    color: "#10B981",
  },
  statusTextCompleted: {
    color: "#0F9F6E",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8EDF4",
    backgroundColor: "#F8FAFD",
    padding: space.md,
  },
  actionRowCheckOut: {
    borderColor: "#FFE4D6",
    backgroundColor: "#FFF8F5",
  },
  actionRowCompleted: {
    borderColor: "#D1FAE5",
    backgroundColor: "#F3FFF8",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F1FF",
    borderWidth: 1,
    borderColor: "#D7E5FF",
  },
  iconWrapCheckOut: {
    backgroundColor: "#FFEFE8",
    borderColor: "#FFD9C6",
  },
  iconWrapCompleted: {
    backgroundColor: "#E9FBF2",
    borderColor: "#BBF7D0",
  },
  actionBody: {
    flex: 1,
    gap: 3,
  },
  actionTitle: {
    color: colors.text,
    fontFamily: font.family.bold,
    fontSize: 14,
  },
  actionSubtitle: {
    color: colors.textMuted,
    fontFamily: font.family.medium,
    fontSize: 11,
    lineHeight: 15,
  },
  button: {
    minWidth: 72,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonCheckOut: {
    backgroundColor: "#FF6B35",
  },
  buttonDisabled: {
    backgroundColor: "#94A3B8",
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: font.family.bold,
    fontSize: 12,
  },
});
