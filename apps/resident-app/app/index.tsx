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
      <AppText
        style={{
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 1.2,
          color: "#7c6f64",
        }}
      >
        RESIDENT HUB
      </AppText>
      <AppText style={{ fontSize: 28, fontWeight: "700", marginBottom: 10 }}>
        Manage entry passes with less back-and-forth.
      </AppText>

      <AppText style={{ marginBottom: 18, color: "#4b5563" }}>
        {user
          ? `Signed in as ${user.name}. Create visitor or delivery passes, then send the QR, screenshot, or guest link directly.`
          : "Only the resident who creates the pass needs to sign in. Visitors and riders do not need an account."}
      </AppText>

      <AppText
        style={{
          marginBottom: 18,
          padding: 14,
          borderRadius: 14,
          backgroundColor: "#fffaf0",
          borderWidth: 1,
          borderColor: "#eadfcb",
          color: "#5b4b3a",
        }}
      >
        Quick flow: create pass, share pass, guard scans at the gate.
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
