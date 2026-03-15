import React from "react";
import { router } from "expo-router";
import { setAuthToken } from "@qr/api";
import { useAuthStore } from "@qr/store";
import { Screen, AppButton, AppText } from "@qr/ui";

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const canAccessGuardTools =
    !!user && (!user.role || user.role === "guard" || user.role === "admin");

  function onLogout() {
    logout();
    setAuthToken("");
    router.replace("/login");
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
        GATE DESK
      </AppText>
      <AppText style={{ fontSize: 28, fontWeight: "700", marginBottom: 10 }}>
        Validate passes and monitor gate activity.
      </AppText>

      {!user ? (
        <>
          <AppText style={{ marginBottom: 14, color: "#4b5563" }}>
            Sign in with a guard or admin account to open the QR scanner and
            incident tools.
          </AppText>
          <AppButton title="Login" onPress={() => router.push("/login")} />
        </>
      ) : canAccessGuardTools ? (
        <>
          <AppText style={{ marginBottom: 14, color: "#4b5563" }}>
            Signed in as {user.name} ({user.role || "guard"}). Keep the line
            moving by scanning passes and checking exceptions quickly.
          </AppText>
          <AppButton title="Scan QR" onPress={() => router.push("/scan")} />
          <AppText style={{ height: 12 }} />
          <AppButton
            title="Incidents"
            onPress={() => router.push("/incidents")}
          />
          <AppText style={{ height: 12 }} />
          <AppButton title="Logout" onPress={onLogout} />
        </>
      ) : (
        <>
          <AppText style={{ marginBottom: 14, color: "#4b5563" }}>
            Access denied. QR scanning and incidents are limited to guard/admin
            accounts.
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
