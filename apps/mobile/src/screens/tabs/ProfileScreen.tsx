import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  getCurrentUser,
  getManagerProfile,
  getStaffProfile,
  type ManagerProfileResponse,
  type StaffProfileResponse,
} from "@madhuban/api";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { RefreshableScrollView } from "../../components/RefreshableScrollView";
import { SkeletonBlock } from "../../components/SkeletonBlock";
import { useAuth } from "../../context/AuthContext";
import { RolePageLayout, formatRoleLabel } from "../../layouts/RolePageLayout";
import { styles } from "../../styles/screens/tabs/profile.styles";

function getStatusPillStyle(tone: "success" | "warning" | undefined) {
  if (tone === "warning") {
    return {
      badge: styles.statusWarning,
      text: styles.statusWarningText,
    };
  }

  return {
    badge: styles.statusSuccess,
    text: styles.statusSuccessText,
  };
}

function readText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function ProfileScreen() {
  const { user, role, clearSession } = useAuth();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfileResponse | null>(null);
  const [managerProfile, setManagerProfile] = useState<ManagerProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const isStaff = String(role ?? user?.role ?? "").trim().toLowerCase() === "staff";
  const isManager = String(role ?? user?.role ?? "").trim().toLowerCase() === "manager";

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      if (isStaff) {
        const next = await getStaffProfile();
        setStaffProfile(next);
        setProfile(null);
        setManagerProfile(null);
      } else if (isManager) {
        const next = await getManagerProfile();
        setManagerProfile(next);
        setStaffProfile(null);
        setProfile(null);
      } else {
        const next = await getCurrentUser();
        setProfile(next);
        setStaffProfile(null);
        setManagerProfile(null);
      }
    } catch {
      setProfile(null);
      setStaffProfile(null);
      setManagerProfile(null);
    } finally {
      setLoading(false);
    }
  }, [isManager, isStaff]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function logout() {
    await clearSession();
    router.replace("/(auth)/login");
  }

  const safeStaffAssignment = staffProfile?.assignment_details;
  const safeStaffStats = staffProfile?.stats;
  const safeStaffFunctions = Array.isArray(staffProfile?.assigned_functions)
    ? staffProfile.assigned_functions
    : [];
  const safeStaffSkills = Array.isArray(staffProfile?.skills_and_certifications)
    ? staffProfile.skills_and_certifications.filter(
        (value): value is string => typeof value === "string" && value.trim().length > 0,
      )
    : [];
  const safeManagerInfo = managerProfile?.profile;
  const safeManagerBadges = managerProfile?.badges;
  const safeManagerAccount = managerProfile?.account;

  const roleLabel = formatRoleLabel(
    String(staffProfile?.role ?? safeManagerInfo?.role ?? profile?.role ?? user?.role),
  );
  const name = String(
    staffProfile?.full_name ??
      safeManagerInfo?.full_name ??
      profile?.name ??
      user?.name ??
      "Rahul Dhumal",
  );
  const employeeIdValue =
    staffProfile?.staff_id ?? safeManagerInfo?.manager_id ?? profile?.id ?? user?.id;
  const employeeId = employeeIdValue ? `EMP-ID: ${String(employeeIdValue)}` : "EMP-ID: MB-0042";

  const profileFacts = isStaff
    ? [
        {
          icon: <Feather name="check" size={16} color="#162236" />,
          label: "Assigned Checker",
          value: readText(safeStaffAssignment?.assigned_checker_name, "Unassigned"),
        },
        {
          icon: <Feather name="clipboard" size={16} color="#94A3B8" />,
          label: "Default Tasks / Day",
          value: `${readNumber(safeStaffAssignment?.default_tasks_per_day)} tasks`,
        },
        {
          icon: <MaterialCommunityIcons name="cash-fast" size={16} color="#D8A548" />,
          label: "Attendance Incentive",
          value: Boolean(safeStaffAssignment?.is_eligible_for_attendance_incentive)
            ? "Eligible"
            : "Not Eligible",
          valueTone: "success" as const,
        },
      ]
    : isManager
      ? [
          {
            icon: <Feather name="briefcase" size={16} color="#162236" />,
            label: "Shift",
            value: readText(safeManagerBadges?.shift, "Unassigned"),
          },
          {
            icon: <Feather name="activity" size={16} color="#94A3B8" />,
            label: "Status",
            value: readText(safeManagerBadges?.status, "Inactive"),
            valueTone:
              String(safeManagerBadges?.status ?? "")
                .trim()
                .toUpperCase()
                .includes("ACTIVE")
                ? ("success" as const)
                : undefined,
          },
          {
            icon: <Feather name="user" size={16} color="#162236" />,
            label: "Reporting To",
            value: readText(safeManagerAccount?.reportingTo, "Not assigned"),
          },
          {
            icon: <Feather name="phone" size={16} color="#94A3B8" />,
            label: "App Version",
            value: readText(safeManagerAccount?.appVersion, "--"),
          },
        ]
      : [
          {
            icon: <Feather name="check" size={16} color="#162236" />,
            label: "Assigned Checker",
            value: String((profile?.reportsTo as string | undefined) ?? "Rahul Tupe"),
          },
        ];

  const functionGroups = isStaff
    ? safeStaffFunctions.map((group) => ({
        title: readText(group.function_name, "Assigned Function"),
        subtitle: group.is_primary ? "Primary Function" : "Secondary Function",
        status: readText(group.status, "Assigned"),
        tone: readText(group.status, "").toLowerCase().includes("support")
          ? ("warning" as const)
          : ("success" as const),
        accent: group.is_primary ? "#FFC83D" : "#2962FF",
        icon: group.is_primary ? ("folder" as const) : ("shield" as const),
        tasks: (Array.isArray(group.zones) ? group.zones : []).map((zone) => {
          const priority = readText(zone.priority, "");
          return {
            text: `${readText(zone.name, "Zone")} - ${readText(zone.floor, "Floor")}`,
            tone: priority,
            toneColor:
              priority.toLowerCase() === "critical"
                ? "#F04438"
                : priority.toLowerCase() === "high"
                  ? "#FF8B2C"
                  : "#2962FF",
            icon: "map-pin",
          };
        }),
      }))
    : isManager
      ? [
          {
            title: readText(safeManagerAccount?.propertyLabel, "Assigned Property"),
            subtitle: readText(safeManagerInfo?.email, "Manager account"),
            status: readText(safeManagerBadges?.status, "INACTIVE"),
            tone: String(safeManagerBadges?.status ?? "")
              .trim()
              .toUpperCase()
              .includes("ACTIVE")
              ? ("success" as const)
              : ("warning" as const),
            accent: "#2962FF",
            icon: "shield" as const,
            tasks: [
              {
                text: `Shift - ${readText(safeManagerBadges?.shift, "Unassigned")}`,
                tone: readText(safeManagerBadges?.status, ""),
                toneColor: "#2962FF",
                icon: "clock",
              },
            ],
          },
        ]
      : [];

  const stats = isStaff
    ? [
        { label: "Functions", value: String(readNumber(safeStaffStats?.functions)) },
        { label: "Zones", value: String(readNumber(safeStaffStats?.zones)) },
        { label: "Location", value: String(readNumber(safeStaffStats?.locations)) },
      ]
    : isManager
      ? [
          { label: "Role", value: String(safeManagerInfo?.role ?? "MANAGER") },
          { label: "Shift", value: String(safeManagerBadges?.shift ?? "--") },
          { label: "Status", value: String(safeManagerBadges?.status ?? "--") },
        ]
      : [];

  const skills = isStaff
    ? safeStaffSkills
    : isManager
      ? [safeManagerAccount?.propertyLabel, safeManagerInfo?.email].filter(
          (value): value is string => Boolean(value),
        )
      : [];

  return (
    <RolePageLayout
      eyebrow={`${roleLabel} · Profile`}
      title={name}
      subtitle={employeeId}
      headerCard={
        <View style={styles.heroCard}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroAvatarText}>
              {(name.match(/\b\w/g) ?? ["R", "D"]).slice(0, 2).join("")}
            </Text>
          </View>
          <View style={styles.heroBody}>
            <Text style={styles.heroName}>{name}</Text>
            <Text style={styles.heroMeta}>{employeeId}</Text>
            <View style={styles.heroBadgeRow}>
              <View style={styles.liveDotWrap}>
                <View style={styles.liveDot} />
              </View>
              <View style={styles.roleBadge}>
                <Ionicons name="business-outline" size={11} color="#8EC4FF" />
                <Text style={styles.roleBadgeText}>{roleLabel.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </View>
      }
    >
      <RefreshableScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onRefresh={loadProfile}
      >
        <View style={styles.infoCard}>
          {loading
            ? [0, 1, 2].map((item) => (
                <View key={item}>
                  <View style={styles.infoRow}>
                    <SkeletonBlock style={{ width: 120, height: 16, borderRadius: 8 }} />
                    <SkeletonBlock style={{ width: 96, height: 16, borderRadius: 8 }} />
                  </View>
                  {item < 2 ? <View style={styles.divider} /> : null}
                </View>
              ))
            : profileFacts.map((item, index) => (
                <View key={`${item.label}-${index}`}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelWrap}>
                      <View style={styles.infoIconWrap}>{item.icon}</View>
                      <Text style={styles.infoLabel}>{item.label}</Text>
                    </View>
                    {"valueTone" in item ? (
                      <View style={[styles.valuePill, styles.valuePillSuccess]}>
                        <Text style={[styles.valuePillText, styles.valuePillSuccessText]}>
                          {item.value}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.infoValue}>{item.value}</Text>
                    )}
                  </View>
                  {index < profileFacts.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="folder" size={16} color="#FFC83D" />
            </View>
            <Text style={styles.sectionTitle}>Assigned Functions & Zones</Text>
          </View>

          <View style={styles.functionList}>
            {loading
              ? [0, 1].map((item) => (
                  <View key={item} style={styles.functionGroup}>
                    <SkeletonBlock style={{ height: 52, borderRadius: 16 }} />
                    <SkeletonBlock style={{ height: 48, borderRadius: 16 }} />
                  </View>
                ))
              : functionGroups.map((group, groupIndex) => {
                  const status = getStatusPillStyle(group.tone);
                  return (
                    <View key={`${group.title}-${groupIndex}`} style={styles.functionGroup}>
                      <View style={styles.functionHeader}>
                        <View
                          style={[
                            styles.functionIconWrap,
                            { backgroundColor: `${group.accent}22` },
                          ]}
                        >
                          <Feather name={group.icon} size={15} color={group.accent} />
                        </View>
                        <View style={styles.functionHeaderBody}>
                          <Text style={styles.functionTitle}>{group.title}</Text>
                          <Text style={styles.functionSubtitle}>{group.subtitle}</Text>
                        </View>
                        <View style={[styles.statusPill, status.badge]}>
                          <Text style={[styles.statusPillText, status.text]}>{group.status}</Text>
                        </View>
                      </View>

                      <View style={styles.functionTaskList}>
                        {group.tasks.map((task, taskIndex) => (
                          <View key={`${task.text}-${taskIndex}`} style={styles.functionTaskRow}>
                            <View
                              style={[styles.functionTaskDot, { backgroundColor: task.toneColor }]}
                            />
                            <Feather name={task.icon as never} size={12} color={task.toneColor} />
                            <Text style={styles.functionTaskText}>{task.text}</Text>
                            {task.tone ? (
                              <View
                                style={[
                                  styles.taskTonePill,
                                  { backgroundColor: `${task.toneColor}18` },
                                ]}
                              >
                                <Text style={[styles.taskToneText, { color: task.toneColor }]}>
                                  {task.tone}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}
          </View>

          {stats.length > 0 ? (
            <View style={styles.statsRow}>
              {stats.map((item, index) => (
                <View key={`${item.label}-${index}`} style={styles.statCell}>
                  <Text style={isManager ? styles.statValueCompact : styles.statValue}>
                    {item.value}
                  </Text>
                  <Text style={isManager ? styles.statLabelCompact : styles.statLabel}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="ribbon-outline" size={16} color="#FFC83D" />
            </View>
            <Text style={styles.sectionTitle}>Skills & Certifications</Text>
          </View>
          <View style={styles.skillsGrid}>
            {loading ? (
              [0, 1, 2].map((item) => (
                <SkeletonBlock key={item} style={{ height: 34, width: 120, borderRadius: 16 }} />
              ))
            ) : skills.length > 0 ? (
              skills.map((skill, index) => (
                <View key={`${skill}-${index}`} style={styles.skillChip}>
                  <Feather name="award" size={12} color="#2962FF" />
                  <Text style={styles.skillChipText}>{skill}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.skillChipText}>No skills or certifications added.</Text>
            )}
          </View>
        </View>

        <Pressable style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color="#FF3131" />
          <Text style={styles.logoutButtonText}>Log Out Securely</Text>
        </Pressable>
      </RefreshableScrollView>
    </RolePageLayout>
  );
}
