import React, { useEffect, useState } from "react";
import QRCode from "react-native-qrcode-svg";
import { api } from "@qr/api";
import { useAuthStore } from "@qr/store";
import { Screen, AppButton, AppText } from "@qr/ui";

export default function QRScreen() {
  const user = useAuthStore((s) => s.user);
  const [token, setToken] = useState("");

  async function refresh() {
    if (!user) return;
    const res = await api.issueResidentToken(user.id);

    console.log("res =>", res);
    if (res.ok) setToken(res.qrToken);
  }

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 30000);
    return () => clearInterval(timer);
  }, [user?.id]);

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
      <AppButton title="Refresh QR" onPress={refresh} />
    </Screen>
  );
}
