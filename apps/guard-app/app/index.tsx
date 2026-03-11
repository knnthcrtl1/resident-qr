import React from "react";
import { router } from "expo-router";
import { useAuthStore } from "@qr/store";
import { Screen, AppButton, AppText } from "@qr/ui";

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const canAccessGuardTools =
    !!user && (!user.role || user.role === "guard" || user.role === "admin");

  return (
    <Screen>
      <AppText style={{ fontSize: 24, fontWeight: "700", marginBottom: 20 }}>
        Guard App
      </AppText>

      {!user ? (
        <>
          <AppText style={{ marginBottom: 12 }}>
            Login required: only guard/admin accounts can open Scan QR and
            Incidents.
          </AppText>
          <AppButton title="Login" onPress={() => router.push("/login")} />
        </>
      ) : canAccessGuardTools ? (
        <>
          <AppText style={{ marginBottom: 12 }}>
            Signed in as {user.name} ({user.role || "guard"}).
          </AppText>
          <AppButton title="Scan QR" onPress={() => router.push("/scan")} />
          <AppText style={{ height: 12 }} />
          <AppButton
            title="Incidents"
            onPress={() => router.push("/incidents")}
          />
        </>
      ) : (
        <>
          <AppText style={{ marginBottom: 12 }}>
            Access denied: Scan QR and Incidents are for guard/admin only.
          </AppText>
          <AppButton
            title="Back to Login"
            onPress={() => router.push("/login")}
          />
        </>
      )}
    </Screen>
  );
}
