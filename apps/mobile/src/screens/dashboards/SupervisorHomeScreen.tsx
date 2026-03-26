import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/screens/tabs/home.styles";

const SUMMARY_STATS = [
  { icon: "alert-circle-outline", value: "12", label: "Needs Review", tint: "#FDB321" },
  { icon: "shield-checkmark-outline", value: "45", label: "Approved", tint: "#2CD88A" },
  { icon: "close-circle-outline", value: "3", label: "Rejected", tint: "#FF5964" },
] as const;

const ATTENTION_ITEMS = [
  {
    status: "10M OVERDUE",
    title: "VIP Lounge Deep Clean",
    initials: "RA",
    assignee: "Rahul D.",
    variant: "danger" as const,
  },
  {
    status: "DUE IN 5M",
    title: "CEO Cabin Prep",
    initials: "AM",
    assignee: "Amit K.",
    variant: "warning" as const,
  },
] as const;

const ZONE_HEALTH = [
  { title: "Washrooms", value: 92, dot: "#20C97A" },
  { title: "Cafeteria", value: 65, dot: "#F59F0B" },
  { title: "Lobby", value: 100, dot: "#20C97A" },
  { title: "Parking", value: 45, dot: "#FF5561" },
] as const;

const ACTIVITY_ITEMS = [
  {
    status: "Approved",
    time: "10:45 AM",
    detail: "Main Entrance Mopping",
    assignee: "Rahul D.",
    tone: "success" as const,
  },
  {
    status: "Sent Back",
    time: "10:30 AM",
    detail: "Washroom #2 Cleaning",
    assignee: "Amit K.",
    tone: "muted" as const,
    note: "Note: Missing soap refill",
  },
  {
    status: "Approved",
    time: "10:15 AM",
    detail: "Conference Room Prep",
    assignee: "Rahul D.",
    tone: "success" as const,
  },
] as const;

function HeroGradient() {
  return (
    <View pointerEvents="none" style={styles.heroGradient}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="supervisorHero" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#263954" />
            <Stop offset="55%" stopColor="#1D2E48" />
            <Stop offset="100%" stopColor="#172231" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#supervisorHero)" />
      </Svg>
      <View style={styles.heroGlowTop} />
      <View style={styles.heroGlowBottom} />
    </View>
  );
}

function SummaryStat({
  icon,
  value,
  label,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  tint: string;
}) {
  return (
    <View style={styles.summaryStat}>
      <View style={styles.summaryStatShine} />
      <Ionicons name={icon} size={14} color="#D8E1F2" />
      <Text style={[styles.summaryValue, { color: tint }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function AttentionCard({
  status,
  title,
  initials,
  assignee,
  variant,
}: {
  status: string;
  title: string;
  initials: string;
  assignee: string;
  variant: "danger" | "warning";
}) {
  const statusStyle =
    variant === "danger" ? styles.attentionStatusDanger : styles.attentionStatusWarning;

  return (
    <View style={styles.attentionCard}>
      <Text style={[styles.attentionStatus, statusStyle]}>{status}</Text>
      <Text style={styles.attentionTitle}>{title}</Text>
      <View style={styles.assigneeRow}>
        <View style={styles.assigneeBadge}>
          <Text style={styles.assigneeBadgeText}>{initials}</Text>
        </View>
        <Text style={styles.assigneeName}>{assignee}</Text>
      </View>
    </View>
  );
}

function ZoneTile({
  title,
  value,
  dot,
}: {
  title: string;
  value: number;
  dot: string;
}) {
  return (
    <View style={styles.zoneTile}>
      <Text style={styles.zoneTitle}>{title}</Text>
      <View style={styles.zoneMetric}>
        <Text style={styles.zoneValue}>{value}%</Text>
        <View style={[styles.zoneDot, { backgroundColor: dot }]} />
      </View>
    </View>
  );
}

function ActivityItem({
  status,
  time,
  detail,
  assignee,
  note,
  tone,
  isLast,
}: {
  status: string;
  time: string;
  detail: string;
  assignee: string;
  note?: string;
  tone: "success" | "muted";
  isLast: boolean;
}) {
  const iconWrapStyle = tone === "success" ? styles.activityIconSuccess : styles.activityIconMuted;
  const iconName = tone === "success" ? "check" : "corner-up-left";
  const iconColor = tone === "success" ? "#1AB85B" : "#7B8AA2";

  return (
    <View style={styles.activityRow}>
      <View style={styles.activityRail}>
        <View style={[styles.activityIconWrap, iconWrapStyle]}>
          <Feather name={iconName} size={13} color={iconColor} />
        </View>
        {!isLast ? <View style={styles.activityLine} /> : null}
      </View>

      <View style={styles.activityBody}>
        <View style={styles.activityHeadline}>
          <Text style={styles.activityStatus}>{status}</Text>
          <Text style={styles.activityTime}>{time}</Text>
        </View>

        <Text style={styles.activityDetail}>
          {detail}
          <Text style={styles.activityAssignee}> - {assignee}</Text>
        </Text>

        {note ? (
          <View style={styles.activityNotePill}>
            <Text style={styles.activityNoteText}>{note}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "RT";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

export function SupervisorHomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const displayName = user?.name?.trim() || "Rahul Type";
  const initials = getInitials(displayName);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { paddingTop: insets.top + 10 }]}>
          <HeroGradient />

          <View style={styles.heroTopRow}>
            <View style={styles.sitePill}>
              <MaterialCommunityIcons name="briefcase-outline" size={12} color="#C8D3E8" />
              <Text style={styles.sitePillText}>AMTP - BANER - DAY</Text>
            </View>

            <View style={styles.heroActions}>
              <View style={styles.avatarCard}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>

              <View style={styles.notificationCard}>
                <Ionicons name="notifications-outline" size={18} color="#EFF4FF" />
                <View style={styles.notificationDot} />
              </View>
            </View>
          </View>

          <Text style={styles.heroTitle}>{displayName}</Text>

          <View style={styles.heroStatusRow}>
            <View style={styles.heroStatusDot} />
            <Text style={styles.heroStatusText}>Shift in progress</Text>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>SUPERVISOR</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            {SUMMARY_STATS.map((stat) => (
              <SummaryStat
                key={stat.label}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                tint={stat.tint}
              />
            ))}
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.card}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionTitleWrap}>
                <Feather name="activity" size={14} color="#4F88FF" />
                <Text style={styles.sectionTitlePrimary}>Shift Completion</Text>
              </View>
              <Text style={styles.progressPercent}>62%</Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>

            <View style={styles.progressLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#25CB7A" }]} />
                <Text style={styles.legendText}>45 Done</Text>
              </View>

              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#F59F0B" }]} />
                <Text style={styles.legendText}>15 Pending</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionTitleWrap}>
                <Ionicons name="flash-outline" size={13} color="#FF9E1A" />
                <Text style={styles.sectionTitleSecondary}>Needs Attention Now</Text>
              </View>
              <Text style={styles.sectionAction}>{"See All ->"}</Text>
            </View>

            <View style={styles.attentionGrid}>
              {ATTENTION_ITEMS.map((item) => (
                <AttentionCard key={item.title} {...item} />
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionTitleWrap}>
                <Ionicons name="location-outline" size={13} color="#6A8EFF" />
                <Text style={styles.sectionTitleSecondary}>Zone Health</Text>
              </View>
              <Text style={styles.sectionAction}>By Zone</Text>
            </View>

            <View style={styles.zoneGrid}>
              {ZONE_HEALTH.map((zone) => (
                <ZoneTile key={zone.title} {...zone} />
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionTitleWrap}>
              <Feather name="activity" size={13} color="#7C8AA4" />
              <Text style={styles.sectionTitleSecondary}>Recent Activity</Text>
            </View>

            <View style={styles.activityList}>
              {ACTIVITY_ITEMS.map((item, index) => (
                <ActivityItem
                  key={`${item.status}-${item.time}`}
                  {...item}
                  isLast={index === ACTIVITY_ITEMS.length - 1}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
