import { Feather, Ionicons } from "@expo/vector-icons";
import {
  getSupervisorAttendance,
  getSupervisorDashboard,
  type SupervisorAttendanceResponse,
  type SupervisorDashboardResponse,
} from "@madhuban/api";
import { font, radii } from "@madhuban/theme";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RefreshableScrollView } from "../../components/RefreshableScrollView";
import { useAuth } from "../../context/AuthContext";

type TimelineTone = "green" | "blue" | "orange" | "gray";

type TimelineItem = {
  time: string;
  title: string;
  detail: string;
  tone: TimelineTone;
};

type AccountRow = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  meta?: string;
};

function formatTime(value: string | null | undefined) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

function formatDate(value: string | null | undefined) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "SU";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function formatPhase(phase: string | null | undefined) {
  const normalized = String(phase ?? "").trim().toUpperCase();
  if (normalized === "ACTIVE") return "Checked In";
  if (normalized === "COMPLETED") return "Checked Out";
  if (normalized === "NOT_CHECKED_IN") return "Awaiting Check-In";
  return normalized || "--";
}

function mapTimeline(
  dashboard: SupervisorDashboardResponse | null,
  attendance: SupervisorAttendanceResponse | null,
): TimelineItem[] {
  const items: TimelineItem[] = [];
  if (attendance?.checkInAt) {
    items.push({
      time: formatTime(attendance.checkInAt),
      title: "Checked In",
      detail: `Attendance marked for ${formatDate(attendance.workDate)}.`,
      tone: "green",
    });
  }

  for (const activity of dashboard?.recentActivity ?? []) {
    items.push({
      time: activity.timeDisplay || formatTime(activity.decidedAt),
      title:
        activity.action === "APPROVED"
          ? "Task Approved"
          : activity.action === "REJECTED"
            ? "Task Sent Back"
            : activity.action,
      detail: `${activity.taskTitle} · ${activity.staffName}${activity.note ? ` · ${activity.note}` : ""}`,
      tone: activity.action === "APPROVED" ? "blue" : "orange",
    });
  }

  if (attendance?.checkOutAt) {
    items.push({
      time: formatTime(attendance.checkOutAt),
      title: "Checked Out",
      detail: `Shift closed for ${formatDate(attendance.workDate)}.`,
      tone: "gray",
    });
  }

  return items.slice(0, 5);
}

export function SupervisorProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, clearSession } = useAuth();
  const [dashboard, setDashboard] = useState<SupervisorDashboardResponse | null>(null);
  const [attendance, setAttendance] = useState<SupervisorAttendanceResponse | null>(null);

  const loadProfile = useCallback(async () => {
    const [nextDashboard, nextAttendance] = await Promise.all([
      getSupervisorDashboard(),
      getSupervisorAttendance(),
    ]);
    setDashboard(nextDashboard);
    setAttendance(nextAttendance);
  }, []);

  useEffect(() => {
    void loadProfile().catch(() => {
      setDashboard(null);
      setAttendance(null);
    });
  }, [loadProfile]);

  const name = dashboard?.profile?.name?.trim() || user?.name?.trim() || "Supervisor";
  const initials = dashboard?.profile?.initials || getInitials(name);
  const shiftLabel = dashboard?.context?.shiftLabel || attendance?.shift || "--";
  const phaseLabel = formatPhase(attendance?.phase);
  const stats = useMemo(
    () => [
      { label: "Zones", value: String(dashboard?.zones?.length ?? 0) },
      { label: "Review", value: String(dashboard?.stats?.needsReview ?? 0) },
      { label: "Approved", value: String(dashboard?.stats?.approved ?? 0) },
    ],
    [dashboard],
  );
  const timeline = useMemo(() => mapTimeline(dashboard, attendance), [attendance, dashboard]);
  const accountRows: AccountRow[] = useMemo(
    () => [
      {
        icon: "business-outline",
        label: "Work Context",
        value: dashboard?.context?.label || "--",
        meta: formatDate(dashboard?.date),
      },
      {
        icon: "time-outline",
        label: "Shift",
        value: shiftLabel,
        meta: dashboard?.context?.shift || attendance?.shift || "--",
      },
      {
        icon: "shield-checkmark-outline",
        label: "Attendance",
        value: phaseLabel,
        meta:
          attendance?.checkOutAt
            ? formatTime(attendance.checkOutAt)
            : attendance?.checkInAt
              ? formatTime(attendance.checkInAt)
              : "--",
      },
    ],
    [attendance, dashboard, phaseLabel, shiftLabel],
  );

  async function logout() {
    await clearSession();
    router.replace("/(auth)/login");
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={[styles.hero, { paddingTop: insets.top + 10 }]}>
        <View style={styles.heroActionRow}>
          <View />
          <View style={styles.notifyButton}>
            <Ionicons name="notifications-outline" size={18} color="#EFF4FF" />
          </View>
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subtitle}>{dashboard?.context?.label || "Supervisor workspace"}</Text>

        <View style={styles.badgesRow}>
          <View style={[styles.badge, styles.badgeShift]}>
            <Text style={styles.badgeText}>{shiftLabel}</Text>
          </View>
          <View style={[styles.badge, styles.badgeActive]}>
            <Text style={styles.badgeText}>{phaseLabel}</Text>
          </View>
          <View style={[styles.badge, styles.badgeRole]}>
            <Text style={styles.badgeText}>{dashboard?.profile?.role || "SUPERVISOR"}</Text>
          </View>
        </View>
      </View>

      <RefreshableScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onRefresh={loadProfile}
      >
        <View style={styles.statsRow}>
          {stats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Feather name="activity" size={14} color="#7B8AA4" />
            <Text style={styles.cardTitle}>Shift Timeline</Text>
          </View>

          {timeline.length > 0 ? (
            <View style={styles.timelineList}>
              {timeline.map((item, index) => (
                <View key={`${item.title}-${item.time}-${index}`} style={styles.timelineRow}>
                  <View style={styles.timelineRail}>
                    <View
                      style={[
                        styles.timelineDot,
                        item.tone === "green"
                          ? styles.timelineDotGreen
                          : item.tone === "blue"
                            ? styles.timelineDotBlue
                            : item.tone === "orange"
                              ? styles.timelineDotOrange
                              : styles.timelineDotGray,
                      ]}
                    />
                    {index !== timeline.length - 1 ? <View style={styles.timelineLine} /> : null}
                  </View>

                  <View style={styles.timelineBody}>
                    <Text style={styles.timelineTime}>{item.time}</Text>
                    <Text style={styles.timelineTitle}>{item.title}</Text>
                    <Text style={styles.timelineDetail}>{item.detail}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Timeline activity will appear here when the API returns attendance or review events.</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Feather name="user" size={14} color="#7B8AA4" />
            <Text style={styles.cardTitle}>Account</Text>
          </View>

          <View style={styles.accountList}>
            {accountRows.map((item, index) => (
              <View
                key={item.label}
                style={[
                  styles.accountRow,
                  index !== accountRows.length - 1 && styles.accountRowBorder,
                ]}
              >
                <View style={styles.accountIconWrap}>
                  <Ionicons name={item.icon} size={17} color="#8392A9" />
                </View>
                <View style={styles.accountTextWrap}>
                  <Text style={styles.accountLabel}>{item.label}</Text>
                  <Text style={styles.accountValue}>{item.value}</Text>
                </View>
                <Text style={styles.accountMeta}>{item.meta ?? "--"}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color="#FF3131" />
          <Text style={styles.logoutButtonText}>Secure Logout</Text>
        </Pressable>
      </RefreshableScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EEF1F5",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 18,
    paddingBottom: 28,
    flexGrow: 1,
  },
  hero: {
    backgroundColor: "#1E2B42",
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    paddingHorizontal: 20,
    paddingBottom: 26,
    alignItems: "center",
    shadowColor: "rgba(15, 23, 40, 0.34)",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 26,
    elevation: 12,
  },
  heroActionRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  notifyButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  avatar: {
    marginTop: 6,
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#FF9C14",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(255, 156, 20, 0.35)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 8,
  },
  avatarText: {
    color: "#FFFFFF",
    fontFamily: font.family.black,
    fontSize: 26,
  },
  name: {
    marginTop: 16,
    color: "#FFFFFF",
    fontFamily: font.family.black,
    fontSize: 17,
    lineHeight: 22,
  },
  subtitle: {
    marginTop: 6,
    color: "#9FB0CA",
    fontFamily: font.family.medium,
    fontSize: 11,
    lineHeight: 14,
  },
  badgesRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  badge: {
    minHeight: 24,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: "center",
  },
  badgeShift: {
    backgroundColor: "#715A1E",
  },
  badgeActive: {
    backgroundColor: "#154F42",
  },
  badgeRole: {
    backgroundColor: "#224579",
  },
  badgeText: {
    color: "#FFFFFF",
    fontFamily: font.family.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  statsRow: {
    paddingHorizontal: 14,
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7ECF4",
    paddingVertical: 18,
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    color: "#1F2A3D",
    fontFamily: font.family.black,
    fontSize: 15.5,
  },
  statLabel: {
    color: "#8B98AD",
    fontFamily: font.family.bold,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  card: {
    marginTop: 14,
    marginHorizontal: 14,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7ECF4",
    padding: 18,
    gap: 16,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    color: "#6E7F98",
    fontFamily: font.family.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  timelineList: {
    gap: 12,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 12,
  },
  timelineRail: {
    width: 20,
    alignItems: "center",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
  },
  timelineDotGreen: {
    backgroundColor: "#24C789",
  },
  timelineDotBlue: {
    backgroundColor: "#5A8CFF",
  },
  timelineDotOrange: {
    backgroundColor: "#FF9C14",
  },
  timelineDotGray: {
    backgroundColor: "#D9E1EE",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    backgroundColor: "#E8EDF5",
  },
  timelineBody: {
    flex: 1,
    paddingBottom: 8,
  },
  timelineTime: {
    color: "#A2AFC2",
    fontFamily: font.family.medium,
    fontSize: 10,
  },
  timelineTitle: {
    marginTop: 2,
    color: "#1F2A3D",
    fontFamily: font.family.bold,
    fontSize: 15,
  },
  timelineDetail: {
    marginTop: 4,
    color: "#7E8DA4",
    fontFamily: font.family.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  emptyText: {
    color: "#7E8DA4",
    fontFamily: font.family.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  accountList: {
    gap: 4,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  accountRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },
  accountIconWrap: {
    width: 28,
    alignItems: "center",
  },
  accountTextWrap: {
    flex: 1,
    gap: 2,
  },
  accountLabel: {
    color: "#1F2A3D",
    fontFamily: font.family.bold,
    fontSize: 14,
  },
  accountValue: {
    color: "#7E8DA4",
    fontFamily: font.family.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  accountMeta: {
    color: "#A4B0C3",
    fontFamily: font.family.bold,
    fontSize: 12,
  },
  logoutButton: {
    marginTop: 14,
    marginHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 18,
    backgroundColor: "#FFF1F1",
    borderWidth: 1,
    borderColor: "#FFD7D7",
    paddingVertical: 16,
  },
  logoutButtonText: {
    color: "#FF3131",
    fontFamily: font.family.black,
    fontSize: 17,
  },
});
