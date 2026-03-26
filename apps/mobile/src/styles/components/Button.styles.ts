import { radii, typography } from "@madhuban/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: {
    ...typography.authButton,
  },
  icon: {
    fontSize: 18,
    fontFamily: typography.authButton.fontFamily,
  },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.55 },
});
