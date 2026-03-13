import React from "react";
import { Text, TextProps } from "react-native";

export function AppText(props: TextProps) {
  return (
    <Text
      {...props}
      style={[
        {
          fontSize: 16,
          lineHeight: 24,
          color: "#14213d",
          letterSpacing: 0.1,
        },
        props.style,
      ]}
    />
  );
}
