import { getMyTasks } from "@madhuban/api";
import type { Task } from "@madhuban/types";
import { colors } from "@madhuban/theme";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { RolePageLayout, formatRoleLabel } from "../../layouts/RolePageLayout";
import { styles } from "../../styles/screens/tabs/tasks.styles";

export function TasksScreen() {
  const { role } = useAuth();
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getMyTasks();
      setTasks(list);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = tasks.filter((task) => {
    const status = String(task.status ?? "").toUpperCase();
    if (tab === "completed") return status === "COMPLETED";
    return status !== "COMPLETED";
  });

  return (
    <RolePageLayout
      eyebrow={`${formatRoleLabel(String(role))} · Workboard`}
      title="Tasks"
      subtitle="Track action items, resubmissions, and team workload."
      headerCard={
        <View style={styles.summaryRow}>
          <View style={styles.summaryTile}>
            <Text style={styles.summaryValue}>{tasks.length}</Text>
            <Text style={styles.summaryLabel}>Total Assigned</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryTile}>
            <Text style={[styles.summaryValue, { color: "#30D19B" }]}>
              {tasks.filter((task) => String(task.status).toUpperCase() === "COMPLETED").length}
            </Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
        </View>
      }
    >
      <View style={styles.root}>
        <View style={styles.tabs}>
          <Pressable
            onPress={() => setTab("active")}
            style={[styles.tab, tab === "active" && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === "active" && styles.tabTextActive]}>
              Active
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("completed")}
            style={[styles.tab, tab === "completed" && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === "completed" && styles.tabTextActive]}>
              Completed
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {filtered.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No tasks here yet</Text>
                <Text style={styles.emptyText}>
                  This tab will fill up once we connect the live dashboard workflow.
                </Text>
              </View>
            ) : (
              filtered.map((task) => (
                <View key={String(task._id ?? task.id)} style={styles.row}>
                  <View style={styles.rowTop}>
                    <Text style={styles.rowTitle}>{task.title}</Text>
                    <Text style={styles.rowMeta}>{String(task.status ?? "")}</Text>
                  </View>
                  <Text style={styles.rowHint}>
                    {String(task.propertyName ?? task.roomNumber ?? "Zone assignment pending")}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </RolePageLayout>
  );
}
