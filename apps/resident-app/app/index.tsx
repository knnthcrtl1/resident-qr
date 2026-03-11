import React from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { setAuthToken } from "@qr/api";
import { useAuthStore } from "@qr/store";
import { Screen, AppButton, AppText } from "@qr/ui";
import { clearResidentSession } from "../hooks/resident-session";

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  async function onLogout() {
    await clearResidentSession();
    setAuthToken("");
    logout();
    Alert.alert("Logged out", "Resident session cleared.");
  }

  return (
    <Screen>
      <AppText style={{ fontSize: 24, fontWeight: "700", marginBottom: 20 }}>
        Resident App
      </AppText>

      <AppText style={{ marginBottom: 16 }}>
        {user
          ? `Signed in as ${user.name}. Create visitor or delivery QR passes and share them directly.`
          : "Resident login is required only for the resident account that creates and shares visitor or delivery passes."}
      </AppText>

      {user ? (
        <>
          <AppButton
            title="Show Resident QR"
            onPress={() => router.push("/qr")}
          />
          <AppText style={{ height: 12 }} />
          <AppButton
            title="Create Visitor or Delivery Pass"
            onPress={() => router.push("/create-visitor")}
          />
          <AppText style={{ height: 12 }} />
          <AppButton title="History" onPress={() => router.push("/history")} />
          <AppText style={{ height: 12 }} />
          <AppButton title="Logout" onPress={onLogout} />
        </>
      ) : (
        <AppButton
          title="Resident Login"
          onPress={() => router.push("/login")}
        />
      )}
    </Screen>
  );
}
