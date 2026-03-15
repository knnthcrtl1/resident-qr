import React, { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "react-native-qrcode-svg";
import { AppState } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "@qr/api";
import { useAuthStore } from "@qr/store";
import { Screen, AppButton, AppText } from "@qr/ui";

const REFRESH_INTERVAL_MS = 60000;
const MIN_REFRESH_GAP_MS = 5000;

export default function QRScreen() {
  const user = useAuthStore((s) => s.user);
  const [token, setToken] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshLock = useRef(false);
  const lastRefreshAtRef = useRef(0);

  const refresh = useCallback(
    async (force = false) => {
      if (!user) return;
      if (refreshLock.current) return;

      const now = Date.now();
      if (!force && now - lastRefreshAtRef.current < MIN_REFRESH_GAP_MS) {
        return;
      }

      refreshLock.current = true;
      setIsRefreshing(true);
      try {
        const res = await api.issueResidentToken(user.id);
        if (res.ok) {
          setToken(res.qrToken);
          lastRefreshAtRef.current = Date.now();
        }
      } finally {
        refreshLock.current = false;
        setIsRefreshing(false);
      }
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      void refresh(true);

      const timer = setInterval(() => {
        void refresh(false);
      }, REFRESH_INTERVAL_MS);

      const appStateSubscription = AppState.addEventListener(
        "change",
        (nextState) => {
          if (nextState === "active") {
            void refresh(false);
          }
        },
      );

      return () => {
        clearInterval(timer);
        appStateSubscription.remove();
      };
    }, [refresh]),
  );

  useEffect(() => {
    if (!user) {
      setToken("");
    }
  }, [user]);

  return (
    <Screen style={{ alignItems: "center", justifyContent: "center" }}>
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
      <AppText
        style={{
          fontSize: 26,
          fontWeight: "700",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Your gate QR refreshes automatically.
      </AppText>
      <AppText
        style={{ marginBottom: 18, textAlign: "center", color: "#4b5563" }}
      >
        Present this code for resident access. Refresh anytime if needed.
      </AppText>
      {token ? (
        <QRCode value={token} size={240} />
      ) : (
        <AppText>No QR available yet.</AppText>
      )}
      <AppText style={{ height: 16 }} />
      <AppButton
        title={isRefreshing ? "Refreshing..." : "Refresh QR"}
        onPress={() => refresh(true)}
        disabled={isRefreshing}
      />
    </Screen>
  );
}
