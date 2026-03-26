import { Feather, Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { RolePageLayout } from "../../layouts/RolePageLayout";

const KPI_CARDS = [
  { label: "Sites Live", value: "08", tone: "#2563EB" },
  { label: "Supervisors Online", value: "21", tone: "#16A34A" },
  { label: "Escalations", value: "03", tone: "#DC2626" },
] as const;

const PRIORITIES = [
  "Review supervisor escalations and overdue shifts",
  "Approve staffing changes for the afternoon roster",
  "Check cross-site productivity and audit exceptions",
] as const;

export function ManagerHomeScreen() {
  return (
    <RolePageLayout
      eyebrow="Manager · Command View"
      title="Operations Overview"
      subtitle="Cross-site performance, approvals, and escalation watchlist."
      headerCard={
        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroLabel}>Today's Focus</Text>
            <Text style={styles.heroValue}>3 escalations need approval</Text>
          </View>
          <Ionicons name="shield-checkmark-outline" size={24} color="#E8F0FF" />
        </View>
      }
    >
      <View style={styles.body}>
        <View style={styles.kpiRow}>
          {KPI_CARDS.map((item) => (
            <View key={item.label} style={styles.kpiCard}>
              <Text style={[styles.kpiValue, { color: item.tone }]}>{item.value}</Text>
              <Text style={styles.kpiLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <View style={styles.panelTitleRow}>
            <Feather name="layers" size={15} color="#5E7393" />
            <Text style={styles.panelTitle}>Manager Dashboard Structure</Text>
          </View>
          <Text style={styles.panelText}>
            This route now belongs only to managers. You can build a completely different
            dashboard here without affecting supervisor or staff screens.
          </Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelTitleRow}>
            <Ionicons name="flash-outline" size={16} color="#D97706" />
            <Text style={styles.panelTitle}>Priority Queue</Text>
          </View>
          {PRIORITIES.map((item) => (
            <View key={item} style={styles.priorityRow}>
              <View style={styles.priorityDot} />
              <Text style={styles.priorityText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </RolePageLayout>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 16,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroLabel: {
    color: "rgba(232, 240, 255, 0.8)",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroValue: {
    marginTop: 6,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  kpiRow: {
    flexDirection: "row",
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5EAF3",
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  kpiLabel: {
    marginTop: 6,
    color: "#6B7890",
    fontSize: 12,
    fontWeight: "600",
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
  panelText: {
    color: "#66758C",
    fontSize: 13,
    lineHeight: 20,
  },
  priorityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#F59E0B",
  },
  priorityText: {
    flex: 1,
    color: "#1E2A3B",
    fontSize: 13,
    lineHeight: 19,
  },
});
