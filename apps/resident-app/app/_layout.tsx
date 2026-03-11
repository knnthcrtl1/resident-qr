import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { setApiConfig, setAuthToken } from "@qr/api";
import { useAuthStore } from "@qr/store";
import { AppText, Screen } from "@qr/ui";
import { loadResidentSession } from "../hooks/resident-session";

if (__DEV__) {
  global.XMLHttpRequest =
    global.originalXMLHttpRequest || global.XMLHttpRequest;
}

setApiConfig({ baseUrl: "http://192.168.1.43:8000/api" });

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

  return <Stack screenOptions={{ headerShown: true }} />;
}
