import { Feather, Ionicons } from "@expo/vector-icons";
import { getMyTasks } from "@madhuban/api";
import { colors } from "@madhuban/theme";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { RolePageLayout, formatRoleLabel } from "../../src/layouts/RolePageLayout";
import { styles } from "../../src/styles/screens/tabs/home.styles";

function HomeStat({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <View style={styles.heroStat}>
      <Text style={[styles.heroStatValue, { color: tint }]}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function SectionTitle({
  icon,
  title,
  action,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  action?: string;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleLeft}>
        <Feather name={icon} size={14} color="#6D7D96" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

export default function HomeScreen() {
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

  const name = user?.name?.split(" ")[0] ?? "Rahul";
  const roleLabel = formatRoleLabel(String(role ?? user?.role));
  const assigned = count ?? 24;
  const completed = count == null ? 24 : Math.max(0, Math.round(count * 0.7));
  const remaining = Math.max(0, assigned - completed);
  const completion = assigned > 0 ? Math.min(100, Math.round((completed / assigned) * 100)) : 70;

  return (
    <RolePageLayout
      eyebrow="Shift · Morning"
      title={`Hi, ${name}!`}
      subtitle="Madhuban Groups"
      meta={roleLabel}
      compact
      headerCard={
        <View style={styles.shiftStatusCard}>
          <View style={styles.shiftStatusBlock}>
            <Text style={styles.shiftStatusLabel}>Check-in Status</Text>
            <View style={styles.shiftStatusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.shiftStatusValue}>Active since 07:59 AM</Text>
            </View>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.shiftDateBlock}>
            <Text style={styles.shiftStatusLabel}>Date</Text>
            <Text style={styles.shiftStatusDate}>25 Mar 2026</Text>
          </View>
        </View>
      }
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <SectionTitle icon="activity" title="Today's Shift Progress" action="View All" />
          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={styles.progressRow}>
              <View style={styles.progressRing}>
                <Text style={styles.progressRingValue}>{completion}%</Text>
                <Text style={styles.progressRingLabel}>Done</Text>
              </View>
              <View style={styles.progressMetric}>
                <Text style={[styles.progressMetricValue, { color: "#109F69" }]}>
                  {completed}
                </Text>
                <Text style={styles.progressMetricLabel}>Completed</Text>
              </View>
              <View style={styles.progressMetric}>
                <Text style={styles.progressMetricValue}>{remaining}</Text>
                <Text style={styles.progressMetricLabel}>Remaining</Text>
              </View>
            </View>
          )}
        </View>

        <View style={[styles.alertCard, styles.alertCardDanger]}>
          <View style={[styles.alertIconWrap, { backgroundColor: "#FFE4E6" }]}>
            <Ionicons name="alert-circle-outline" size={22} color="#FF4D5E" />
          </View>
          <View style={styles.alertBody}>
            <Text style={[styles.alertEyebrow, { color: "#FF3B49" }]}>Action Needed</Text>
            <Text style={styles.alertTitle}>3 Critical Tasks Pending</Text>
            <Text style={styles.alertHint}>Requires immediate attention</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#FF4D5E" />
        </View>

        <View style={[styles.alertCard, styles.alertCardInfo]}>
          <View style={[styles.alertIconWrap, { backgroundColor: "#F1E8FF" }]}>
            <Ionicons name="reload-outline" size={22} color="#B445FF" />
          </View>
          <View style={styles.alertBody}>
            <Text style={[styles.alertEyebrow, { color: "#8A35FF" }]}>Task Update</Text>
            <Text style={styles.alertTitle}>1 Task Reassigned</Text>
            <Text style={styles.alertHint}>Clear Trash Bins · Cafeteria</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#B445FF" />
        </View>

        <View style={styles.card}>
          <SectionTitle icon="check-square" title="Task Approval Status" action="12 in Pipeline" />
          <View style={styles.approvalGrid}>
            <HomeStat label="Submitted" value="4" tint="#2667FF" />
            <HomeStat label="Sent Back" value="2" tint="#F59E0B" />
            <HomeStat label="Sup. Reject" value="1" tint="#F43F5E" />
            <HomeStat label="AM Reject" value="1" tint="#EF4444" />
          </View>
        </View>
      </ScrollView>
    </RolePageLayout>
  );
}
