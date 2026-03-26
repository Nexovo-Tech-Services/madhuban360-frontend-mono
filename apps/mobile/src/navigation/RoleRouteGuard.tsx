import type { UserRole } from "@madhuban/types";
import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { getRoleHomePath, isRoleAllowed } from "./roleRoutes";

export function RoleRouteGuard({
  allowedRoles,
}: {
  allowedRoles: Array<UserRole | string>;
}) {
  const { token, role, isReady } = useAuth();

  if (!isReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/(auth)/splash" />;
  }

  if (!isRoleAllowed(role, allowedRoles)) {
    return <Redirect href={getRoleHomePath(role)} />;
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
});
