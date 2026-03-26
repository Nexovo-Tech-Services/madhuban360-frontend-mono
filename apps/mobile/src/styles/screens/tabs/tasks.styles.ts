import { colors, font, radii } from "@madhuban/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 16,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  summaryTile: {
    flex: 1,
    gap: 6,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontFamily: font.family.black,
    fontSize: 28,
    lineHeight: 30,
  },
  summaryLabel: {
    color: "rgba(225,233,245,0.72)",
    fontFamily: font.family.bold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  summaryDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  tabs: {
    flexDirection: "row",
    gap: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: "#EBF0F7",
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: "#5F718F",
    fontFamily: font.family.bold,
    fontSize: 12,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 12,
    paddingBottom: 18,
  },
  row: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7ECF4",
    padding: 16,
    gap: 8,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  rowTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: font.family.bold,
    fontSize: 16,
    lineHeight: 21,
  },
  rowMeta: {
    color: colors.primary,
    fontFamily: font.family.bold,
    fontSize: 11,
    textTransform: "uppercase",
  },
  rowHint: {
    color: colors.textMuted,
    fontFamily: font.family.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  emptyCard: {
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7ECF4",
    padding: 20,
    gap: 8,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: font.family.bold,
    fontSize: 17,
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: font.family.medium,
    fontSize: 13,
    lineHeight: 18,
  },
});
