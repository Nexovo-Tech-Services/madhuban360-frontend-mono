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

function readText(value: unknown, fallback = "--"): string {
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
  const normalizedRole = String(role ?? user?.role ?? "").trim().toLowerCase();
  const isStaff = normalizedRole === "staff";
  const isManager = normalizedRole === "manager";

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

  const roleLabel = formatRoleLabel(
    String(staffProfile?.role ?? managerProfile?.profile.role ?? profile?.role ?? user?.role),
  );
  const name = readText(
    staffProfile?.full_name ?? managerProfile?.profile.full_name ?? profile?.name ?? user?.name,
    `${roleLabel} User`,
  );
  const employeeIdValue =
    staffProfile?.staff_id ?? managerProfile?.profile.manager_id ?? profile?.id ?? user?.id;
  const employeeId = employeeIdValue ? `EMP-ID: ${String(employeeIdValue)}` : "EMP-ID: --";
  const profileInitials =
    (name.match(/\b\w/g) ?? [roleLabel[0] ?? "U"]).slice(0, 2).join("").toUpperCase();

  const genericManager = profile?.manager as { name?: string } | null | undefined;
  const genericSupervisor = profile?.supervisor as { name?: string } | null | undefined;

  const profileFacts = isStaff
    ? [
        {
          icon: <Feather name="check" size={16} color="#162236" />,
          label: "Assigned Checker",
          value: readText(staffProfile?.assignment_details.assigned_checker_name, "Unassigned"),
        },
        {
          icon: <Feather name="clipboard" size={16} color="#94A3B8" />,
          label: "Default Tasks / Day",
          value: `${readNumber(staffProfile?.assignment_details.default_tasks_per_day)} tasks`,
        },
        {
          icon: <MaterialCommunityIcons name="cash-fast" size={16} color="#D8A548" />,
          label: "Attendance Incentive",
          value: staffProfile?.assignment_details.is_eligible_for_attendance_incentive
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
            value: readText(managerProfile?.badges.shift),
          },
          {
            icon: <Feather name="activity" size={16} color="#94A3B8" />,
            label: "Status",
            value: readText(managerProfile?.badges.status, "Inactive"),
            valueTone:
              String(managerProfile?.badges.status ?? "")
                .trim()
                .toUpperCase()
                .includes("ACTIVE")
                ? ("success" as const)
                : undefined,
          },
          {
            icon: <Feather name="user" size={16} color="#162236" />,
            label: "Reporting To",
            value: readText(managerProfile?.account.reportingTo, "Not assigned"),
          },
          {
            icon: <Feather name="smartphone" size={16} color="#94A3B8" />,
            label: "App Version",
            value: readText(managerProfile?.account.appVersion),
          },
        ]
      : [
          {
            icon: <Feather name="mail" size={16} color="#162236" />,
            label: "Email",
            value: readText(profile?.email),
          },
          {
            icon: <Feather name="briefcase" size={16} color="#94A3B8" />,
            label: "Role",
            value: roleLabel,
          },
          {
            icon: <Feather name="users" size={16} color="#162236" />,
            label: "Reports To",
            value: readText(genericSupervisor?.name ?? genericManager?.name, "Not assigned"),
          },
        ];

  const functionGroups = isStaff
    ? staffProfile?.assigned_functions.map((group) => ({
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
      })) ?? []
    : isManager
      ? [
          {
            title: readText(managerProfile?.account.propertyLabel, "Assigned Property"),
            subtitle: readText(managerProfile?.profile.email, "Manager account"),
            status: readText(managerProfile?.badges.status, "Inactive"),
            tone: String(managerProfile?.badges.status ?? "")
              .trim()
              .toUpperCase()
              .includes("ACTIVE")
              ? ("success" as const)
              : ("warning" as const),
            accent: "#2962FF",
            icon: "shield" as const,
            tasks: [
              {
                text: `Shift - ${readText(managerProfile?.badges.shift, "Unassigned")}`,
                tone: readText(managerProfile?.badges.status, ""),
                toneColor: "#2962FF",
                icon: "clock",
              },
            ],
          },
        ]
      : [];

  const stats = isStaff
    ? [
        { label: "Functions", value: String(readNumber(staffProfile?.stats.functions)) },
        { label: "Zones", value: String(readNumber(staffProfile?.stats.zones)) },
        { label: "Location", value: String(readNumber(staffProfile?.stats.locations)) },
      ]
    : isManager
      ? [
          { label: "Role", value: readText(managerProfile?.profile.role, "MANAGER") },
          { label: "Shift", value: readText(managerProfile?.badges.shift) },
          { label: "Status", value: readText(managerProfile?.badges.status) },
        ]
      : [];

  const skills = isStaff
    ? staffProfile?.skills_and_certifications.filter(
        (value): value is string => typeof value === "string" && value.trim().length > 0,
      ) ?? []
    : isManager
      ? [managerProfile?.account.propertyLabel, managerProfile?.profile.email].filter(
          (value): value is string => typeof value === "string" && value.trim().length > 0,
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
            <Text style={styles.heroAvatarText}>{profileInitials}</Text>
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
                    <View style={styles.infoLabelWrap}>
                      <SkeletonBlock style={{ width: 120, height: 16, borderRadius: 8 }} />
                    </View>
                    <SkeletonBlock style={{ width: 120, height: 16, borderRadius: 8 }} />
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
              : functionGroups.length > 0
                ? functionGroups.map((group, groupIndex) => {
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
                  })
                : <Text style={styles.skillChipText}>No function or zone assignments are available.</Text>}
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
