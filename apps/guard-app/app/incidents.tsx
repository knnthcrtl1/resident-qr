import React, { useEffect } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@qr/store";
import { Screen, AppText } from "@qr/ui";

export default function IncidentsScreen() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) {
      Alert.alert("Login required", "Please login as guard/admin first.", [
        { text: "Go to Login", onPress: () => router.replace("/login") },
      ]);
      return;
    }

    if (user.role && user.role !== "guard" && user.role !== "admin") {
      Alert.alert(
        "Access denied",
        "Only guard or admin accounts can open Incidents.",
        [{ text: "Back", onPress: () => router.replace("/") }],
      );
    }
  }, [user]);

  return (
    <Screen>
      <AppText style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        Incidents
      </AppText>
      <AppText>Incident reports will appear here.</AppText>
    </Screen>
  );
}
