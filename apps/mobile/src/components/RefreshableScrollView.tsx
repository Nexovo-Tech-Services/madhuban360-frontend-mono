import type { ReactNode } from "react";
import {
  RefreshControl,
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors } from "@madhuban/theme";
import { usePullToRefresh } from "../hooks/usePullToRefresh";

type RefreshableScrollViewProps = Omit<ScrollViewProps, "refreshControl" | "children"> & {
  children: ReactNode;
  onRefresh?: () => Promise<void> | void;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function RefreshableScrollView({
  children,
  onRefresh,
  contentContainerStyle,
  ...props
}: RefreshableScrollViewProps) {
  const { refreshing, triggerRefresh } = usePullToRefresh(onRefresh);

  return (
    <ScrollView
      {...props}
      contentContainerStyle={contentContainerStyle}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={triggerRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {children}
    </ScrollView>
  );
}
