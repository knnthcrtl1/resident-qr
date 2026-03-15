import React, { useState } from "react";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import { router } from "expo-router";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Switch,
  TextInput,
  View,
} from "react-native";
import { api, getApiErrorMessage } from "@qr/api";
import { Screen, AppButton, AppText } from "@qr/ui";
import type { CreatePassPayload, PassKind } from "@qr/types";
import { useResidentRouteAccess } from "../hooks/use-resident-route-access";

type GeneratedPassView = {
  label: string;
  passType: PassKind;
  qrToken: string;
  guestUrl?: string;
  expiresAt: string;
  plateNo?: string | null;
  status: string;
};

export default function CreateVisitorScreen() {
  const { user, canAccess } = useResidentRouteAccess();
  const [passType, setPassType] = useState<PassKind>("visitor");
  const [visitorName, setVisitorName] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [hasVehicle, setHasVehicle] = useState(false);
  const [plateNo, setPlateNo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPass, setGeneratedPass] = useState<GeneratedPassView | null>(
    null,
  );

  function formatDateTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  function buildShareMessage() {
    if (!generatedPass) return "";

    const guestLinkLine = generatedPass.guestUrl
      ? `\n\nGuest web pass (no app):\n${generatedPass.guestUrl}`
      : "";

    const plateLine = generatedPass.plateNo
      ? `\nPlate number: ${generatedPass.plateNo}`
      : "";

    return `${generatedPass.passType === "visitor" ? "Visitor" : "Delivery"} pass for ${generatedPass.label}\n\nPass code:\n${generatedPass.qrToken}\n\nStatus: ${generatedPass.status}\nExpires: ${formatDateTime(generatedPass.expiresAt)}${plateLine}${guestLinkLine}\n\nGuest can show the QR image, screenshot, or guest page at the gate.`;
  }

  async function sharePass() {
    if (!generatedPass) return;

    await Share.share({
      message: buildShareMessage(),
    });
  }

  async function copyPassCode() {
    if (!generatedPass) return;

    await Clipboard.setStringAsync(generatedPass.qrToken);
    Alert.alert("Copied", "Pass code copied to clipboard.");
  }

  async function openSmsComposer() {
    if (!generatedPass) return;

    const smsUrl = `sms:?body=${encodeURIComponent(buildShareMessage())}`;
    const canOpen = await Linking.canOpenURL(smsUrl);

    if (!canOpen) {
      Alert.alert("Cannot open", "SMS app is not available on this device.");
      return;
    }

    await Linking.openURL(smsUrl);
  }

  async function shareGuestLink() {
    if (!generatedPass?.guestUrl) {
      Alert.alert("Missing link", "Guest web pass link is not available.");
      return;
    }

    await Share.share({
      message: `Guest pass link (no account, no app):\n${generatedPass.guestUrl}`,
    });
  }

  async function openGuestLink() {
    if (!generatedPass?.guestUrl) {
      Alert.alert("Missing link", "Guest web pass link is not available.");
      return;
    }

    const canOpen = await Linking.canOpenURL(generatedPass.guestUrl);
    if (!canOpen) {
      Alert.alert("Cannot open", "Could not open guest pass link.");
      return;
    }

    await Linking.openURL(generatedPass.guestUrl);
  }

  async function onCreate() {
    if (isSubmitting) return;
    if (!canAccess) return;
    if (!user) {
      Alert.alert(
        "Resident login required",
        "Please login with the resident account first.",
      );
      router.push("/login");
      return;
    }

    if (!user.householdId) {
      Alert.alert(
        "Missing household",
        "Your resident account is missing a household assignment.",
      );
      return;
    }

    if (passType === "visitor" && !visitorName.trim()) {
      Alert.alert("Missing fields", "Visitor name is required.");
      return;
    }

    if (passType === "delivery" && !deliveryType.trim()) {
      Alert.alert("Missing fields", "Delivery type is required.");
      return;
    }

    if (hasVehicle && !plateNo.trim()) {
      Alert.alert(
        "Missing fields",
        "Plate number is required when vehicle is enabled.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const later = new Date(Date.now() + 2 * 60 * 60 * 1000);

      const payload: CreatePassPayload = {
        pass_type: passType,
        household_id: user.householdId,
        issued_by_user_id: user.id,
        visitor_name: passType === "visitor" ? visitorName.trim() : undefined,
        delivery_type:
          passType === "delivery" ? deliveryType.trim() : undefined,
        has_vehicle: hasVehicle,
        plate_no: hasVehicle ? plateNo.trim() : "",
        valid_from: now.toISOString(),
        valid_until: later.toISOString(),
      };

      const res = await api.createPass(payload);

      if (res.ok && res.qrToken) {
        setGeneratedPass({
          label:
            passType === "visitor" ? visitorName.trim() : deliveryType.trim(),
          passType,
          qrToken: res.qrToken,
          guestUrl: res.guestUrl,
          expiresAt: res.pass?.valid_until ?? later.toISOString(),
          plateNo: res.pass?.plate_no ?? null,
          status: res.pass?.status ?? "active",
        });
        Alert.alert(
          "Pass created",
          `${passType === "visitor" ? "Visitor" : "Delivery"} QR is ready to share.`,
        );
      } else {
        Alert.alert("Error", res.message || "Could not create pass");
      }
    } catch (error) {
      console.error("Create pass error:", error);
      Alert.alert(
        "Error",
        getApiErrorMessage(error, "Could not create pass. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <AppText
          style={{
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 1.2,
            color: "#7c6f64",
          }}
        >
          GUEST PASS
        </AppText>
        <AppText style={{ fontSize: 28, fontWeight: "700", marginBottom: 8 }}>
          Create a pass the guest can show instantly.
        </AppText>

        <AppText style={{ marginBottom: 18, color: "#4b5563" }}>
          Resident creates the pass, then shares the QR image/screenshot or
          guest web link directly to the visitor or delivery rider.
        </AppText>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <Pressable
            onPress={() => setPassType("visitor")}
            style={{
              backgroundColor: passType === "visitor" ? "#111827" : "#e5e7eb",
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <AppText
              style={{ color: passType === "visitor" ? "white" : "#111827" }}
            >
              Visitor
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setPassType("delivery")}
            style={{
              backgroundColor: passType === "delivery" ? "#111827" : "#e5e7eb",
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <AppText
              style={{ color: passType === "delivery" ? "white" : "#111827" }}
            >
              Delivery
            </AppText>
          </Pressable>
        </View>

        {passType === "visitor" ? (
          <TextInput
            placeholder="Visitor name"
            value={visitorName}
            onChangeText={setVisitorName}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              padding: 12,
              borderRadius: 8,
              marginBottom: 12,
            }}
          />
        ) : (
          <TextInput
            placeholder="Delivery type or rider label"
            value={deliveryType}
            onChangeText={setDeliveryType}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              padding: 12,
              borderRadius: 8,
              marginBottom: 12,
            }}
          />
        )}

        <AppText style={{ marginBottom: 8 }}>Has vehicle?</AppText>
        <Switch value={hasVehicle} onValueChange={setHasVehicle} />

        {hasVehicle ? (
          <TextInput
            placeholder="Plate number"
            value={plateNo}
            onChangeText={setPlateNo}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              padding: 12,
              borderRadius: 8,
              marginTop: 12,
              marginBottom: 12,
            }}
          />
        ) : null}

        <AppButton
          title={isSubmitting ? "Creating pass..." : "Create Pass"}
          onPress={onCreate}
          disabled={isSubmitting}
        />

        {generatedPass ? (
          <View
            style={{
              alignItems: "center",
              borderColor: "#e6ddcf",
              borderRadius: 20,
              borderWidth: 1,
              marginTop: 24,
              padding: 16,
              backgroundColor: "#fffdf8",
            }}
          >
            <AppText
              style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}
            >
              Ready to Share
            </AppText>
            <AppText style={{ marginBottom: 16 }}>
              {generatedPass.passType === "visitor" ? "Visitor" : "Delivery"}:{" "}
              {generatedPass.label}
            </AppText>
            <QRCode value={generatedPass.qrToken} size={220} />
            <View
              style={{
                width: "100%",
                marginTop: 16,
                borderRadius: 12,
                backgroundColor: "#f9fafb",
                padding: 14,
                gap: 8,
              }}
            >
              <AppText>Status: {generatedPass.status}</AppText>
              <AppText>
                Expires: {formatDateTime(generatedPass.expiresAt)}
              </AppText>
              <AppText>
                Plate number:{" "}
                {generatedPass.plateNo ? generatedPass.plateNo : "N/A"}
              </AppText>
              <AppText>Pass code:</AppText>
              <AppText selectable style={{ fontSize: 12 }}>
                {generatedPass.qrToken}
              </AppText>
            </View>
            <AppText style={{ marginVertical: 16, textAlign: "center" }}>
              Ask the guest to present this QR at the gate. They can also send
              it through Messenger, Viber, WhatsApp, or SMS, or just show a
              screenshot or open the guest web link.
            </AppText>
            <AppButton title="Share Pass" onPress={sharePass} />
            <View style={{ height: 10 }} />
            <AppButton title="Copy Pass Code" onPress={copyPassCode} />
            <View style={{ height: 10 }} />
            <AppButton title="Send via SMS" onPress={openSmsComposer} />
            <View style={{ height: 10 }} />
            <AppButton title="Share Guest Link" onPress={shareGuestLink} />
            <View style={{ height: 10 }} />
            <AppButton title="Open Guest Link" onPress={openGuestLink} />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
