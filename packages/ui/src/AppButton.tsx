import React from "react";
import { Pressable, Text } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export function AppButton({ title, onPress, disabled = false }: Props) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: disabled ? "#94a3b8" : "#183b56",
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 14,
        alignItems: "center",
        opacity: disabled ? 0.8 : 1,
        shadowColor: "#183b56",
        shadowOpacity: disabled ? 0 : 0.14,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: disabled ? 0 : 2,
      }}
    >
      <Text
        style={{
          color: "white",
          fontWeight: "700",
          fontSize: 15,
          letterSpacing: 0.2,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
