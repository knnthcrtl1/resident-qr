import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { setAuthToken } from "@qr/api";
import { useAuthStore } from "@qr/store";
import { AppText, Screen } from "@qr/ui";
import { loadResidentSession } from "../hooks/resident-session";

if (__DEV__) {
  global.XMLHttpRequest =
    global.originalXMLHttpRequest || global.XMLHttpRequest;
}

export default function Layout() {
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    async function hydrateResidentSession() {
      const session = await loadResidentSession();

      if (!active) {
        return;
      }

      if (session?.user && session.token) {
        setUser(session.user);
        setToken(session.token);
        setAuthToken(session.token);
      }

      setIsHydrated(true);
    }

    hydrateResidentSession();

    return () => {
      active = false;
    };
  }, [setToken, setUser]);

  if (!isHydrated) {
    return (
      <Screen style={{ alignItems: "center", justifyContent: "center" }}>
        <AppText>Loading resident session...</AppText>
      </Screen>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#183b56" },
        headerTintColor: "#fffdf7",
        headerTitleStyle: { fontWeight: "700", fontSize: 18 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#f6f3ed" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Resident Portal" }} />
      <Stack.Screen name="login" options={{ title: "Resident Sign In" }} />
      <Stack.Screen name="qr" options={{ title: "Resident Access QR" }} />
      <Stack.Screen
        name="create-visitor"
        options={{ title: "Create Guest Pass" }}
      />
      <Stack.Screen name="history" options={{ title: "Pass History" }} />
    </Stack>
  );
}
