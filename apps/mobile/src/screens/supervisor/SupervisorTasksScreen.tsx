import { Feather, Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { font, radii } from "@madhuban/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RefreshableScrollView } from "../../components/RefreshableScrollView";

const TOP_FILTERS = ["ALL", "BY ZONE", "BY FUNCTION", "BY MAKER"] as const;
const STATUS_FILTERS = ["All", "Needs Review", "Sent Back", "Approved"] as const;

const REVIEW_TASKS = [
  {
    id: "vip-lounge",
    priority: "CRITICAL",
    floor: "Floor 3",
    title: "VIP Lounge Deep Clean",
    assigneeInitials: "RA",
    assigneeName: "Rahul D.",
    time: "10:45 AM",
    status: "Needs Review",
    statusNote: "10m overdue",
    tone: "red" as const,
  },
  {
    id: "lobby-glass",
    priority: "HIGH",
    floor: "Ground Floor",
    title: "Lobby Glass Cleaning",
    assigneeInitials: "RA",
    assigneeName: "Rahul D.",
    time: "11:30 AM",
    status: "Needs Review",
    statusNote: "Due in 5m",
    tone: "orange" as const,
  },
  {
    id: "washroom-two",
    priority: "HIGH",
    floor: "Floor 1",
    title: "Washroom #2 Cleaning",
    assigneeInitials: "AM",
    assigneeName: "Amit K.",
    time: "10:30 AM",
    status: "Sent Back",
    statusNote: "Waiting on maker",
    tone: "orange" as const,
  },
  {
    id: "ceo-cabin",
    priority: "CRITICAL",
    floor: "Floor 3",
    title: "CEO Cabin Prep",
    assigneeInitials: "RA",
    assigneeName: "Ravi S.",
    time: "09:00 AM",
    status: "Approved",
    statusNote: "Checked",
    tone: "green" as const,
  },
  {
    id: "parking",
    priority: "MEDIUM",
    floor: "Basement",
    title: "Parking Sweeping",
    assigneeInitials: "PR",
    assigneeName: "Prakash",
    time: "12:00 PM",
    status: "Pending",
    statusNote: "Not Started",
    tone: "gray" as const,
  },
  {
    id: "conference",
    priority: "MEDIUM",
    floor: "Floor 2",
    title: "Conference Room Setup",
    assigneeInitials: "RA",
    assigneeName: "Rahul D.",
    time: "11:15 AM",
    status: "Needs Review",
    statusNote: "Just Finished",
    tone: "orange" as const,
  },
] as const;

export function SupervisorTasksScreen() {
  const insets = useSafeAreaInsets();
  const [selectedTopFilter, setSelectedTopFilter] =
    useState<(typeof TOP_FILTERS)[number]>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]>("All");

  const tasks = REVIEW_TASKS.filter((task) =>
    selectedStatusFilter === "All" ? true : task.status === selectedStatusFilter,
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={[styles.hero, { paddingTop: insets.top + 10 }]}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroTitle}>Reviews</Text>
            <Text style={styles.heroSubtitle}>12 pending checks</Text>
          </View>
          <Pressable style={styles.heroIconButton}>
            <Ionicons name="notifications-outline" size={18} color="#EFF4FF" />
            <View style={styles.heroNotificationDot} />
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <Feather name="search" size={16} color="#8C9AB3" />
            <TextInput
              placeholder="Search task, zone, maker..."
              placeholderTextColor="#7D8BA5"
              style={styles.searchInput}
            />
          </View>
          <Pressable style={styles.filterButton}>
            <Ionicons name="filter-outline" size={18} color="#E6ECF8" />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.topFiltersRow}>
            {TOP_FILTERS.map((filter) => {
              const active = filter === selectedTopFilter;
              return (
                <Pressable
                  key={filter}
                  onPress={() => setSelectedTopFilter(filter)}
                  style={[styles.topFilterChip, active && styles.topFilterChipActive]}
                >
                  <Text style={[styles.topFilterText, active && styles.topFilterTextActive]}>
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.body}>
        <RefreshableScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onRefresh={async () => {}}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.statusFilterRow}>
              {STATUS_FILTERS.map((filter) => {
                const active = filter === selectedStatusFilter;
                return (
                  <Pressable
                    key={filter}
                    onPress={() => setSelectedStatusFilter(filter)}
                  style={[
                    styles.statusChip,
                    filter === "All"
                      ? styles.statusAll
                      : filter === "Needs Review"
                        ? styles.statusNeedsReview
                        : filter === "Sent Back"
                          ? styles.statusSentBack
                          : styles.statusApproved,
                    active && styles.statusChipActive,
                  ]}
                  >
                    <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>
                      {filter}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {tasks.map((task) => (
            <View key={task.id} style={styles.cardWrap}>
              <View
                style={[
                  styles.cardAccent,
                  task.tone === "red"
                    ? styles.cardAccentRed
                    : task.tone === "orange"
                      ? styles.cardAccentOrange
                      : task.tone === "green"
                        ? styles.cardAccentGreen
                        : styles.cardAccentGray,
                ]}
              />
              <View style={styles.card}>
                <View style={styles.cardMain}>
                  <View style={styles.cardMetaRow}>
                    <View style={styles.priorityPill}>
                      <Text style={styles.priorityPillText}>{task.priority}</Text>
                    </View>
                    <View style={styles.floorRow}>
                      <Ionicons name="location-outline" size={11} color="#9AA7BD" />
                      <Text style={styles.floorText}>{task.floor}</Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>{task.title}</Text>

                  <View style={styles.assigneeRow}>
                    <View style={styles.assigneeBadge}>
                      <Text style={styles.assigneeBadgeText}>{task.assigneeInitials}</Text>
                    </View>
                    <Text style={styles.assigneeName}>{task.assigneeName}</Text>
                  </View>
                </View>

                <View style={styles.cardAside}>
                  <Text style={styles.cardTime}>{task.time}</Text>
                  <Text
                    style={[
                      styles.cardStatus,
                      task.tone === "red"
                        ? styles.cardStatusRed
                        : task.tone === "orange"
                          ? styles.cardStatusOrange
                          : task.tone === "green"
                            ? styles.cardStatusGreen
                            : styles.cardStatusGray,
                    ]}
                  >
                    {task.status}
                  </Text>
                  <Text
                    style={[
                      styles.cardStatusNote,
                      task.tone === "red"
                        ? styles.cardStatusRed
                        : task.tone === "orange"
                          ? styles.cardStatusOrange
                          : task.tone === "green"
                            ? styles.cardStatusGreen
                            : styles.cardStatusGray,
                    ]}
                  >
                    {task.statusNote}
                  </Text>

                  <Pressable style={styles.expandButton}>
                    <Ionicons name="chevron-down" size={18} color="#7D90B0" />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </RefreshableScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EDF0F5",
  },
  hero: {
    backgroundColor: "#1E2C43",
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "rgba(15, 23, 40, 0.34)",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 26,
    elevation: 12,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontFamily: font.family.black,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1,
  },
  heroSubtitle: {
    marginTop: 2,
    color: "#8FB8FF",
    fontFamily: font.family.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  heroIconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroNotificationDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: "#FF5B6D",
  },
  searchRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10,
  },
  searchField: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#31415B",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  searchInput: {
    flex: 1,
    color: "#F3F6FC",
    fontFamily: font.family.medium,
    fontSize: 14,
    paddingVertical: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#31415B",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  topFiltersRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
  },
  topFilterChip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#36455F",
  },
  topFilterChipActive: {
    backgroundColor: "#FFA61B",
  },
  topFilterText: {
    color: "#DCE5F2",
    fontFamily: font.family.bold,
    fontSize: 10,
    letterSpacing: 1,
  },
  topFilterTextActive: {
    color: "#FFFFFF",
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 26,
    gap: 12,
    flexGrow: 1,
  },
  statusFilterRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 6,
  },
  statusChip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  statusChipActive: {
    shadowColor: "rgba(31, 41, 55, 0.12)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 4,
  },
  statusAll: {
    backgroundColor: "#1F2C42",
    borderColor: "#1F2C42",
  },
  statusNeedsReview: {
    backgroundColor: "#FFF7E8",
    borderColor: "#FFD690",
  },
  statusSentBack: {
    backgroundColor: "#FFF0EB",
    borderColor: "#FFC5AF",
  },
  statusApproved: {
    backgroundColor: "#EAFBF2",
    borderColor: "#A6E7C2",
  },
  statusChipText: {
    fontFamily: font.family.bold,
    fontSize: 12,
  },
  statusChipTextActive: {
    color: "#FFFFFF",
  },
  cardWrap: {
    borderRadius: 24,
    overflow: "hidden",
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF5",
  },
  cardAccent: {
    width: 5,
  },
  cardAccentRed: {
    backgroundColor: "#FF4A58",
  },
  cardAccentOrange: {
    backgroundColor: "#FF9F1A",
  },
  cardAccentGreen: {
    backgroundColor: "#1FCF86",
  },
  cardAccentGray: {
    backgroundColor: "#D9E1EE",
  },
  card: {
    flex: 1,
    minHeight: 118,
    flexDirection: "row",
  },
  cardMain: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  cardAside: {
    width: 108,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderLeftWidth: 1,
    borderLeftColor: "#EDF1F6",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priorityPill: {
    height: 20,
    paddingHorizontal: 8,
    borderRadius: 8,
    justifyContent: "center",
    backgroundColor: "#F4F7FB",
    borderWidth: 1,
    borderColor: "#E0E7F2",
  },
  priorityPillText: {
    color: "#73839C",
    fontFamily: font.family.bold,
    fontSize: 8,
    letterSpacing: 1.2,
  },
  floorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  floorText: {
    color: "#95A3B9",
    fontFamily: font.family.medium,
    fontSize: 11,
  },
  cardTitle: {
    color: "#1E293B",
    fontFamily: font.family.black,
    fontSize: 29 / 2,
    lineHeight: 20,
  },
  assigneeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  assigneeBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3FF",
  },
  assigneeBadgeText: {
    color: "#2D67FF",
    fontFamily: font.family.bold,
    fontSize: 10,
  },
  assigneeName: {
    color: "#58667D",
    fontFamily: font.family.bold,
    fontSize: 12,
  },
  cardTime: {
    color: "#A6B2C6",
    fontFamily: font.family.medium,
    fontSize: 10,
  },
  cardStatus: {
    textAlign: "right",
    fontFamily: font.family.bold,
    fontSize: 13,
    lineHeight: 16,
  },
  cardStatusNote: {
    textAlign: "right",
    fontFamily: font.family.bold,
    fontSize: 11,
    lineHeight: 14,
  },
  cardStatusRed: {
    color: "#FF4A58",
  },
  cardStatusOrange: {
    color: "#FF8E12",
  },
  cardStatusGreen: {
    color: "#18B56F",
  },
  cardStatusGray: {
    color: "#8E9BB0",
  },
  expandButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF3",
  },
});
