import React from "react";
import { Text, TextProps } from "react-native";

export function AppText(props: TextProps) {
  return (
    <Text {...props} style={[{ fontSize: 16, color: "#111" }, props.style]} />
  );
}
