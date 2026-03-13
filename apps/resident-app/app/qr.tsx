import React, { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "react-native-qrcode-svg";
import { api } from "@qr/api";
import { useAuthStore } from "@qr/store";
import { Screen, AppButton, AppText } from "@qr/ui";

export default function QRScreen() {
  const user = useAuthStore((s) => s.user);
  const [token, setToken] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshLock = useRef(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    if (refreshLock.current) return;

    refreshLock.current = true;
    setIsRefreshing(true);
    try {
      const res = await api.issueResidentToken(user.id);
      if (res.ok) setToken(res.qrToken);
    } finally {
      refreshLock.current = false;
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 30000);
    return () => clearInterval(timer);
  }, [refresh]);

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
        onPress={refresh}
        disabled={isRefreshing}
      />
    </Screen>
  );
}
