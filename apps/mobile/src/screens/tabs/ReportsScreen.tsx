import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { RolePageLayout, formatRoleLabel } from "../../layouts/RolePageLayout";
import { styles } from "../../styles/screens/tabs/reports.styles";

const RANGES = ["Day", "Week", "Month", "Year"] as const;

export function ReportsScreen() {
  const { role } = useAuth();
  const [range, setRange] = useState<(typeof RANGES)[number]>("Week");

  return (
    <RolePageLayout
      eyebrow={`${formatRoleLabel(String(role))} · Analytics`}
      title="Reports"
      subtitle="Snapshot performance across shifts, tasks, and approvals."
      headerCard={
        <View style={styles.heroCardRow}>
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricValue}>75%</Text>
            <Text style={styles.heroMetricLabel}>Completion</Text>
          </View>
          <View style={styles.heroMetricDivider} />
          <View style={styles.heroMetric}>
            <Text style={[styles.heroMetricValue, { color: "#30D19B" }]}>12</Text>
            <Text style={styles.heroMetricLabel}>In Pipeline</Text>
          </View>
        </View>
      }
    >
      <View style={styles.root}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.rangeRow}>
            {RANGES.map((item) => (
              <Pressable
                key={item}
                onPress={() => setRange(item)}
                style={[styles.chip, range === item && styles.chipActive]}
              >
                <Text style={[styles.chipText, range === item && styles.chipTextActive]}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleWrap}>
              <Feather name="bar-chart-2" size={16} color="#5E7393" />
              <Text style={styles.cardTitle}>Performance Summary</Text>
            </View>
            <Text style={styles.cardAction}>{range}</Text>
          </View>
          <Text style={styles.metric}>75%</Text>
          <Text style={styles.caption}>
            Completion rate across submitted work, approvals, and on-floor actions.
          </Text>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Next step for this module</Text>
          <Text style={styles.noteText}>
            Each role now has its own route group, so we can plug manager and supervisor
            analytics into this shell without coupling them to one shared dashboard entry.
          </Text>
        </View>
      </View>
    </RolePageLayout>
  );
}
