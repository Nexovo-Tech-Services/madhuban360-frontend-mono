import { colors } from "@madhuban/theme";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { useAuth } from "../../src/context/AuthContext";
import { RolePageLayout, formatRoleLabel } from "../../src/layouts/RolePageLayout";
import { styles } from "../../src/styles/screens/tabs/profile.styles";

export default function ProfileScreen() {
  const { user, clearSession } = useAuth();

  async function logout() {
    await clearSession();
    router.replace("/(auth)/login");
  }

  const initials = (user?.name ?? "User").slice(0, 2).toUpperCase();
  const roleLabel = formatRoleLabel(String(user?.role));

  return (
    <RolePageLayout
      eyebrow={`${roleLabel} · Account`}
      title={user?.name ?? "Your Profile"}
      subtitle={user?.email ?? user?.mobile ?? "Account details"}
      headerCard={
        <View style={styles.heroCard}>
          <Text style={styles.heroCardLabel}>Signed in as</Text>
          <Text style={styles.heroCardValue}>{roleLabel}</Text>
        </View>
      }
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <Text style={styles.avatar}>{initials}</Text>
          <Text style={styles.name}>{user?.name ?? "User"}</Text>
          <Text style={styles.meta}>{user?.email ?? "No email on file"}</Text>
          <Text style={styles.meta}>{user?.mobile ?? "No mobile number on file"}</Text>
          <Text style={styles.meta}>Role: {roleLabel}</Text>
        </View>

        <View style={styles.section}>
          <Button title="Log out" variant="danger" onPress={logout} />
        </View>
      </ScrollView>
    </RolePageLayout>
  );
}
