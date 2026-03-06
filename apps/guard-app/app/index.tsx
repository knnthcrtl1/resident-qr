import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { api } from "@qr/api";

export default function GuardScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"IN" | "OUT">("IN");

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission?.granted]);

  async function onScan(data: string) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await api.validateScan({
        token: data,
        guard_user_id: 999, // temp for testing
        gate: "gate1",
        direction: mode,
      });
      Alert.alert(res.result, res.message || "OK");
    } catch (e) {
      Alert.alert("Error", "Validation failed. Check connection.");
    } finally {
      setTimeout(() => setBusy(false), 1200);
    }
  }

  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Camera permission required.</Text>
        <Button title="Allow camera" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 16 }}>Gate1 | Mode: {mode}</Text>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
          <Button title="IN" onPress={() => setMode("IN")} />
          <Button title="OUT (Resident only)" onPress={() => setMode("OUT")} />
        </View>
      </View>

      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={(e) => onScan(e.data)}
      />
    </View>
  );
}
