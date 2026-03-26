import { Feather, Ionicons } from "@expo/vector-icons";
import { getMyTasks } from "@madhuban/api";
import { colors } from "@madhuban/theme";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { RolePageLayout, formatRoleLabel } from "../../layouts/RolePageLayout";

function MetricCard({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={[styles.metricValue, { color: tint }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function StaffHomeScreen() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const tasks = await getMyTasks();
      setCount(tasks.length);
    } catch {
      setCount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const roleLabel = formatRoleLabel(String(role ?? user?.role));
  const firstName = user?.name?.split(" ")[0] ?? "Rahul";
  const assigned = count ?? 24;
  const completed = count == null ? 18 : Math.max(0, Math.round(count * 0.7));
  const remaining = Math.max(0, assigned - completed);

  return (
    <RolePageLayout
      eyebrow="Shift · Morning"
      title={`Hi, ${firstName}!`}
      subtitle="Madhuban Groups"
      meta={roleLabel}
      compact
      headerCard={
        <View style={styles.headerCard}>
          <View>
            <Text style={styles.headerLabel}>Check-in Status</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.headerValue}>Active since 07:59 AM</Text>
            </View>
          </View>
          <View style={styles.headerDivider} />
          <View>
            <Text style={styles.headerLabel}>Date</Text>
            <Text style={styles.headerValue}>26 Mar 2026</Text>
          </View>
        </View>
      }
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.panel}>
          <View style={styles.panelTitleRow}>
            <Feather name="activity" size={15} color="#5E7393" />
            <Text style={styles.panelTitle}>Today's Shift Progress</Text>
          </View>
          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={styles.metricGrid}>
              <MetricCard label="Assigned" value={String(assigned)} tint="#2563EB" />
              <MetricCard label="Completed" value={String(completed)} tint="#16A34A" />
              <MetricCard label="Remaining" value={String(remaining)} tint="#DC2626" />
            </View>
          )}
        </View>

        <View style={[styles.banner, styles.bannerDanger]}>
          <View style={styles.bannerIcon}>
            <Ionicons name="alert-circle-outline" size={20} color="#FF4D5E" />
          </View>
          <View style={styles.bannerBody}>
            <Text style={styles.bannerEyebrow}>Action Needed</Text>
            <Text style={styles.bannerTitle}>3 critical tasks pending</Text>
            <Text style={styles.bannerText}>Requires immediate attention on this shift.</Text>
          </View>
        </View>

        <View style={[styles.banner, styles.bannerInfo]}>
          <View style={styles.bannerIcon}>
            <Ionicons name="reload-outline" size={20} color="#7C3AED" />
          </View>
          <View style={styles.bannerBody}>
            <Text style={styles.bannerEyebrow}>Task Update</Text>
            <Text style={styles.bannerTitle}>1 task reassigned</Text>
            <Text style={styles.bannerText}>Clear Trash Bins · Cafeteria</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelTitleRow}>
            <Feather name="check-square" size={15} color="#5E7393" />
            <Text style={styles.panelTitle}>Approval Status</Text>
          </View>
          <View style={styles.metricGrid}>
            <MetricCard label="Submitted" value="4" tint="#2563EB" />
            <MetricCard label="Sent Back" value="2" tint="#D97706" />
            <MetricCard label="Sup. Reject" value="1" tint="#E11D48" />
          </View>
        </View>
      </ScrollView>
    </RolePageLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
    gap: 16,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  headerLabel: {
    color: "rgba(232, 240, 255, 0.8)",
    fontSize: 12,
    fontWeight: "600",
  },
  headerValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#30D19B",
  },
  headerDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    gap: 14,
  },
  panelTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  panelTitle: {
    color: "#162236",
    fontSize: 15,
    fontWeight: "700",
  },
  loaderWrap: {
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
  },
  metricGrid: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#F8FAFD",
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  metricLabel: {
    color: "#6B7890",
    fontSize: 12,
    fontWeight: "600",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
  },
  bannerDanger: {
    backgroundColor: "#FFF4F5",
    borderColor: "#FFD5D8",
  },
  bannerInfo: {
    backgroundColor: "#F7F4FF",
    borderColor: "#E5DAFF",
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  bannerBody: {
    flex: 1,
    gap: 2,
  },
  bannerEyebrow: {
    color: "#6B7890",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  bannerTitle: {
    color: "#162236",
    fontSize: 15,
    fontWeight: "700",
  },
  bannerText: {
    color: "#6B7890",
    fontSize: 12,
    lineHeight: 18,
  },
});
