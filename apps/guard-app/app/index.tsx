import React from "react";
import { router } from "expo-router";
import { Screen, AppButton, AppText } from "@qr/ui";

export default function HomeScreen() {
  return (
    <Screen>
      <AppText style={{ fontSize: 24, fontWeight: "700", marginBottom: 20 }}>
        Guard App
      </AppText>

      <AppButton title="Login" onPress={() => router.push("/login")} />
      <AppText style={{ height: 12 }} />
      <AppButton title="Scan QR" onPress={() => router.push("/scan")} />
      <AppText style={{ height: 12 }} />
      <AppButton title="Incidents" onPress={() => router.push("/incidents")} />
    </Screen>
  );
}
