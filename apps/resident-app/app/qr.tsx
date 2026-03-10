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
      <AppText style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        Resident QR
      </AppText>
      {token ? (
        <QRCode value={token} size={240} />
      ) : (
        <AppText>No QR yet</AppText>
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
