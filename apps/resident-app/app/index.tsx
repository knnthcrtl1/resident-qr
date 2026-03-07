import React from "react";
import { router } from "expo-router";
import { Screen, AppButton, AppText } from "@qr/ui";

export default function HomeScreen() {
  return (
    <Screen>
      <AppText style={{ fontSize: 24, fontWeight: "700", marginBottom: 20 }}>
        Resident App
      </AppText>

      <AppButton title="Login" onPress={() => router.push("/login")} />
      <AppText style={{ height: 12 }} />
      <AppButton title="Show QR" onPress={() => router.push("/qr")} />
      <AppText style={{ height: 12 }} />
      <AppButton
        title="Create Visitor Pass"
        onPress={() => router.push("/create-visitor")}
      />
      <AppText style={{ height: 12 }} />
      <AppButton title="History" onPress={() => router.push("/history")} />
    </Screen>
  );
}
