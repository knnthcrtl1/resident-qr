import React, { useState } from "react";
import { TextInput, Alert } from "react-native";
import { api, setAuthToken } from "@qr/api";
import { useAuthStore } from "@qr/store";
import { Screen, AppButton, AppText } from "@qr/ui";
import axios from "axios";

export default function LoginScreen() {
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  async function testPing() {
    try {
      console.log("Testing direct ping...");
      const res = await axios.get("http://192.168.1.43:8080/api/ping");
      console.log("PING SUCCESS:", res.status, res.data);
    } catch (error: any) {
      console.log("PING ERROR MESSAGE:", error.message);
      console.log("PING ERROR CODE:", error.code);
      console.log("PING ERROR RESPONSE:", error?.response?.data);
      console.log("PING ERROR STATUS:", error?.response?.status);
    }
  }
  async function onLogin() {
    try {
      console.log("Starting login attempt with:", { emailOrPhone, password });
      const res = await api.login(emailOrPhone, password);
      console.log("Login response:", res);

      if (res.ok && res.user) {
        setUser(res.user);
        if (res.token) {
          setToken(res.token);
          setAuthToken(res.token);
        }
        Alert.alert("Success", `Welcome ${res.user.name}`);
      } else {
        Alert.alert("Login failed", res.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Network error or server not reachable");
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
      <AppButton title="Test Ping" onPress={testPing} />
    </Screen>
  );
}
