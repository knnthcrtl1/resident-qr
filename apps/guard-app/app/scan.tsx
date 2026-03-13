import React, { useEffect, useState } from "react";
import { Alert, Button, Dimensions, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { api } from "@qr/api";
import { useAuthStore } from "@qr/store";
import { Screen, AppText } from "@qr/ui";
import type { ValidateScanResponse } from "@qr/types";

const QR_BOX_SIZE = Math.min(Dimensions.get("window").width - 56, 320);

export default function ScanScreen() {
  const user = useAuthStore((s) => s.user);
  const [permission, requestPermission] = useCameraPermissions();
  const [direction, setDirection] = useState<"IN" | "OUT">("IN");
  const [busy, setBusy] = useState(false);
  const [lastScan, setLastScan] = useState<ValidateScanResponse | null>(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission?.granted, requestPermission]);

  useEffect(() => {
    if (!user) {
      Alert.alert("Login required", "Please login as guard/admin first.", [
        { text: "Go to Login", onPress: () => router.replace("/login") },
      ]);
      return;
    }

    if (user.role && user.role !== "guard" && user.role !== "admin") {
      Alert.alert(
        "Access denied",
        "Only guard or admin accounts can use scanner.",
        [{ text: "Back", onPress: () => router.replace("/") }],
      );
    }
  }, [user]);

  async function onScan(token: string) {
    if (!user) {
      Alert.alert("Login required", "Please login as guard/admin first.");
      router.replace("/login");
      return;
    }

    if (user.role && user.role !== "guard" && user.role !== "admin") {
      Alert.alert("Access denied", "Only guard or admin can scan QR.");
      return;
    }

    if (busy) return;

    setBusy(true);
    try {
      const res = await api.validateScan({
        token,
        guard_user_id: user.id,
        gate: "gate1",
        direction,
      });

      setLastScan(res);
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
        <AppText
          style={{
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 1.2,
            color: "#7c6f64",
          }}
        >
          QR VALIDATION
        </AppText>
        <AppText style={{ fontSize: 26, fontWeight: "700", marginBottom: 6 }}>
          Scan inside the frame for faster reads.
        </AppText>
        <AppText style={{ marginBottom: 10, color: "#4b5563" }}>
          Use IN for arrivals. Visitor and delivery passes are checked for
          status, expiry, usage, and plate details.
        </AppText>
        <AppText style={{ marginBottom: 8, fontWeight: "600" }}>
          Mode: {direction}
        </AppText>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button title="IN" onPress={() => setDirection("IN")} />
          <Button title="OUT" onPress={() => setDirection("OUT")} />
        </View>

        {lastScan ? (
          <View
            style={{
              marginTop: 12,
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 12,
              padding: 12,
              backgroundColor: lastScan.ok ? "#ecfdf5" : "#fef2f2",
            }}
          >
            <AppText style={{ fontWeight: "700", marginBottom: 4 }}>
              {lastScan.result}
            </AppText>
            <AppText>{lastScan.message || "Scan complete"}</AppText>
            {lastScan.display ? (
              <>
                <AppText style={{ marginTop: 8 }}>
                  Type: {lastScan.display.type}
                </AppText>
                {lastScan.display.visitorName ? (
                  <AppText>Visitor: {lastScan.display.visitorName}</AppText>
                ) : null}
                {lastScan.display.deliveryType ? (
                  <AppText>Delivery: {lastScan.display.deliveryType}</AppText>
                ) : null}
                {lastScan.display.plateNo ? (
                  <AppText>Plate: {lastScan.display.plateNo}</AppText>
                ) : null}
              </>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={{ flex: 1 }}>
        <CameraView
          style={{ flex: 1 }}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={(e) => onScan(e.data)}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: QR_BOX_SIZE,
              height: QR_BOX_SIZE,
              borderWidth: 3,
              borderColor: "#ffffff",
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          />

          <View
            style={{
              marginTop: 14,
              backgroundColor: "rgba(0,0,0,0.55)",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <AppText style={{ color: "white", textAlign: "center" }}>
              Align QR inside the box
            </AppText>
            <AppText style={{ color: "#d1d5db", textAlign: "center" }}>
              Recommended size: around 220 to 300 px on screen
            </AppText>
          </View>
        </View>
      </View>
    </Screen>
  );
}
