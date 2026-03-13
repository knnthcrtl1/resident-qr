import React from "react";
import { SafeAreaView, ViewProps } from "react-native";

export function Screen(props: ViewProps) {
  return (
    <SafeAreaView
      {...props}
      style={[
        {
          flex: 1,
          backgroundColor: "#f6f3ed",
          padding: 20,
        },
        props.style,
      ]}
    />
  );
}
