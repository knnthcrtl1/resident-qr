import React, { useEffect, useState } from "react";
import { Alert, Button, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { api } from "@qr/api";
import { useAuthStore } from "@qr/store";
import { Screen, AppText } from "@qr/ui";

export default function ScanScreen() {
  const user = useAuthStore((s) => s.user);
  const [permission, requestPermission] = useCameraPermissions();
  const [direction, setDirection] = useState<"IN" | "OUT">("IN");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission?.granted, requestPermission]);

  async function onScan(token: string) {
    if (!user || busy) return;

    setBusy(true);
    try {
      const res = await api.validateScan({
        token,
        guard_user_id: user.id,
        gate: "gate1",
        direction,
      });

      Alert.alert(res.result, res.message || "Scan complete");
    } finally {
      setTimeout(() => setBusy(false), 1000);
    }
  }

  if (!permission?.granted) {
    return (
      <Screen>
        <AppText>Camera permission required.</AppText>
        <View style={{ height: 12 }} />
        <Button title="Allow Camera" onPress={requestPermission} />
      </Screen>
    );
  }

  return (
    <Screen style={{ padding: 0 }}>
      <View style={{ padding: 16 }}>
        <AppText style={{ fontSize: 20, fontWeight: "700" }}>
          Guard Scanner
        </AppText>
        <AppText style={{ marginVertical: 8 }}>Mode: {direction}</AppText>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button title="IN" onPress={() => setDirection("IN")} />
          <Button title="OUT" onPress={() => setDirection("OUT")} />
        </View>
      </View>

      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={(e) => onScan(e.data)}
      />
    </Screen>
  );
}
