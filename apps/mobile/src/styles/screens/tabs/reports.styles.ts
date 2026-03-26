import { colors, font, radii } from "@madhuban/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 16,
  },
  heroCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  heroMetric: {
    flex: 1,
    gap: 6,
  },
  heroMetricValue: {
    color: "#FFFFFF",
    fontFamily: font.family.black,
    fontSize: 28,
    lineHeight: 30,
  },
  heroMetricLabel: {
    color: "rgba(225,233,245,0.72)",
    fontFamily: font.family.bold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroMetricDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  rangeRow: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: "#EAF0F8",
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: "#62748E",
    fontFamily: font.family.bold,
    fontSize: 12,
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  card: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7ECF4",
    padding: 18,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    color: "#6C7B93",
    fontFamily: font.family.bold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cardAction: {
    color: colors.primary,
    fontFamily: font.family.bold,
    fontSize: 12,
  },
  metric: {
    color: colors.text,
    fontFamily: font.family.black,
    fontSize: 48,
    lineHeight: 52,
  },
  caption: {
    color: colors.textMuted,
    fontFamily: font.family.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  noteCard: {
    borderRadius: 22,
    backgroundColor: "#F3F6FB",
    borderWidth: 1,
    borderColor: "#E1E7F0",
    padding: 18,
    gap: 8,
  },
  noteTitle: {
    color: colors.text,
    fontFamily: font.family.bold,
    fontSize: 16,
  },
  noteText: {
    color: colors.textMuted,
    fontFamily: font.family.medium,
    fontSize: 13,
    lineHeight: 18,
  },
});
