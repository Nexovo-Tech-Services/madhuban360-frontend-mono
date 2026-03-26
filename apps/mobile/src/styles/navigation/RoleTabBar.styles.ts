import { colors, font, radii } from "@madhuban/theme";
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E7EDF5",
    paddingTop: 10,
    paddingHorizontal: 10,
    shadowColor: "rgba(21, 30, 47, 0.14)",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: Platform.OS === "ios" ? 1 : 0,
    shadowRadius: 18,
    elevation: 18,
  },
  inner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 54,
  },
  iconWrap: {
    minHeight: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -7,
    width: 7,
    height: 7,
    borderRadius: radii.full,
    backgroundColor: "#F04A59",
  },
  label: {
    color: "#98A2B3",
    fontFamily: font.family.medium,
    fontSize: 11,
    lineHeight: 14,
  },
  labelActive: {
    color: colors.text,
    fontFamily: font.family.bold,
  },
});
