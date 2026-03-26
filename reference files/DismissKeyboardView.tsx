import React from "react";
import { Keyboard, TouchableWithoutFeedback, Platform, View } from "react-native";

type Props = {
  children: React.ReactNode;
};

export function DismissKeyboardView({ children }: Props) {
  if (Platform.OS === "web") {
    // On web, wrapping inputs in a TouchableWithoutFeedback can block focus.
    // Simply render children so typing works normally.
    return <>{children}</>;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
}
