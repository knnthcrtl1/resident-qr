import React, { useEffect, useState } from "react";
import { TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { api, setAuthToken } from "@qr/api";
import { useAuthStore } from "@qr/store";
import { Screen, AppButton, AppText } from "@qr/ui";
import { saveResidentSession } from "../hooks/resident-session";

export default function LoginScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user]);

  async function onLogin() {
    if (isSubmitting) return;
    if (!emailOrPhone.trim() || !password) {
      Alert.alert("Missing fields", "Email/phone and password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.login(emailOrPhone, password);

      if (res.ok && res.user && res.token) {
        setUser(res.user);
        setToken(res.token);
        setAuthToken(res.token);
        await saveResidentSession({ user: res.user, token: res.token });
        router.replace("/");
      } else {
        Alert.alert("Login failed", res.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Network error or server not reachable");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <AppText
        style={{
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 1.2,
          color: "#7c6f64",
        }}
      >
        RESIDENT ACCESS
      </AppText>
      <AppText style={{ fontSize: 26, fontWeight: "700", marginBottom: 8 }}>
        Sign in to create and manage guest passes.
      </AppText>
      <AppText style={{ marginBottom: 18, color: "#4b5563" }}>
        Use your resident account. Guests do not need to install the app or log
        in.
      </AppText>

      <TextInput
        placeholder="Resident email or phone"
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

      <AppButton
        title={isSubmitting ? "Signing in..." : "Sign In"}
        onPress={onLogin}
        disabled={isSubmitting}
      />
    </Screen>
  );
}
