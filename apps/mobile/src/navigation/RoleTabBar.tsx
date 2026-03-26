import { Ionicons } from "@expo/vector-icons";
import { colors } from "@madhuban/theme";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { styles } from "../styles/navigation/RoleTabBar.styles";
import { getTabsForRole, type TabName } from "./tabConfig";

type RoleTabBarProps = {
  state: {
    index: number;
    routes: Array<{
      key: string;
      name: string;
      params?: object;
    }>;
  };
  descriptors: Record<
    string,
    {
      options: {
        tabBarLabel?: unknown;
        title?: unknown;
      };
    }
  >;
  navigation: {
    emit: (event: any) => any;
    navigate: (name: string, params?: object) => void;
  };
};

const ICONS: Record<TabName, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> =
  {
    home: { active: "home", inactive: "home-outline" },
    tasks: { active: "clipboard", inactive: "clipboard-outline" },
    reports: { active: "bar-chart", inactive: "bar-chart-outline" },
    profile: { active: "person", inactive: "person-outline" },
    qr: { active: "scan", inactive: "scan-outline" },
  };

export function RoleTabBar({ state, descriptors, navigation }: RoleTabBarProps) {
  const insets = useSafeAreaInsets();
  const { role } = useAuth();
  const tabs = getTabsForRole(role);

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.inner}>
        {tabs.map((tab) => {
          const index = state.routes.findIndex((route) => route.name === tab.name);
          if (index === -1) return null;

          const route = state.routes[index];
          const focused = state.index === index;
          const descriptor = descriptors[route.key];
          const label =
            typeof descriptor.options.tabBarLabel === "string"
              ? descriptor.options.tabBarLabel
              : typeof descriptor.options.title === "string"
                ? descriptor.options.title
                : tab.title;
          const iconName = focused ? ICONS[tab.name].active : ICONS[tab.name].inactive;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={label}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
              onLongPress={() =>
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                })
              }
              style={styles.item}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={iconName}
                  size={21}
                  color={focused ? colors.text : "#93A0B4"}
                />
                {tab.name === "tasks" ? <View style={styles.badge} /> : null}
              </View>
              <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
