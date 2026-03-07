import React, { useState } from "react";
import { TextInput, Alert } from "react-native";
import { api } from "@qr/api";
import { useAuthStore } from "@qr/store";
import { Screen, AppButton, AppText } from "@qr/ui";

export default function LoginScreen() {
  const setUser = useAuthStore((s) => s.setUser);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  async function onLogin() {
    const res = await api.login(emailOrPhone, password);
    if (res.ok && res.user) {
      setUser(res.user);
      Alert.alert("Success", `Welcome ${res.user.name}`);
    } else {
      Alert.alert("Login failed", res.message || "Invalid credentials");
    }
  }

  return (
    <Screen>
      <AppText style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        Resident Login
      </AppText>

      <TextInput
        placeholder="Email or phone"
        value={emailOrPhone}
        onChangeText={setEmailOrPhone}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        }}
      />

      <AppButton title="Login" onPress={onLogin} />
    </Screen>
  );
}
