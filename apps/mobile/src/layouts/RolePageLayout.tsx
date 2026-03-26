import { Feather, Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../styles/layouts/RolePageLayout.styles";

function GradientHero() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="roleHeroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#34496B" />
            <Stop offset="45%" stopColor="#263754" />
            <Stop offset="100%" stopColor="#172338" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#roleHeroGradient)" />
      </Svg>
      <View style={styles.heroGlowBlue} />
      <View style={styles.heroGlowDark} />
    </View>
  );
}

export function formatRoleLabel(role: string | undefined) {
  const normalized = String(role ?? "staff").toLowerCase();
  if (normalized === "supervisor") return "Supervisor";
  if (normalized === "manager") return "Manager";
  if (normalized === "admin") return "Admin";
  if (normalized === "guard") return "Guard";
  return "Staff";
}

export function RolePageLayout({
  eyebrow,
  title,
  subtitle,
  meta,
  headerCard,
  children,
  bodyStyle,
  compact = false,
  onNotificationPress,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  meta?: string;
  headerCard?: ReactNode;
  children: ReactNode;
  bodyStyle?: StyleProp<ViewStyle>;
  compact?: boolean;
  onNotificationPress?: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.heroWrap,
          compact && styles.heroWrapCompact,
          { paddingTop: insets.top + 14 },
        ]}
      >
        <GradientHero />
        <View style={styles.heroTopRow}>
          <View style={styles.eyebrowPill}>
            <Text style={styles.eyebrowText}>{eyebrow}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            hitSlop={10}
            onPress={onNotificationPress}
            style={styles.notifyButton}
          >
            <Ionicons name="notifications-outline" size={20} color="#F8FAFF" />
            <View style={styles.notifyDot} />
          </Pressable>
        </View>

        <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>

        {(subtitle || meta) ? (
          <View style={[styles.subtitleRow, compact && styles.subtitleRowCompact]}>
            <Feather name="briefcase" size={14} color="rgba(226,233,246,0.76)" />
            <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>
              {[subtitle, meta].filter(Boolean).join(" · ")}
            </Text>
          </View>
        ) : null}

        {headerCard ? (
          <View style={[styles.headerCard, compact && styles.headerCardCompact]}>
            {headerCard}
          </View>
        ) : null}
      </View>

      <View style={[styles.body, compact && styles.bodyCompact, bodyStyle]}>{children}</View>
    </View>
  );
}
