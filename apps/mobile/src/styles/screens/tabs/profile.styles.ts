import { colors, font, radii } from "@madhuban/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  heroCard: {
    gap: 6,
  },
  heroCardLabel: {
    color: "rgba(225,233,245,0.72)",
    fontFamily: font.family.bold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroCardValue: {
    color: "#FFFFFF",
    fontFamily: font.family.black,
    fontSize: 24,
    lineHeight: 28,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: 16,
    paddingBottom: 22,
  },
  profileCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7ECF4",
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 76,
    fontFamily: font.family.black,
    fontSize: 24,
    overflow: "hidden",
  },
  name: {
    marginTop: 8,
    color: colors.text,
    fontFamily: font.family.black,
    fontSize: 22,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: font.family.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    gap: 12,
  },
});
