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
        backgroundColor: disabled ? "#6b7280" : "#111827",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: "center",
        opacity: disabled ? 0.8 : 1,
      }}
    >
      <Text style={{ color: "white", fontWeight: "600" }}>{title}</Text>
    </Pressable>
  );
}
