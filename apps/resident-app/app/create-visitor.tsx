import React, { useState } from "react";
import QRCode from "react-native-qrcode-svg";
import { router } from "expo-router";
import {
  Alert,
  Linking,
  Pressable,
  Share,
  Switch,
  TextInput,
  View,
} from "react-native";
import { api } from "@qr/api";
import { useAuthStore } from "@qr/store";
import { Screen, AppButton, AppText } from "@qr/ui";

export default function CreateVisitorScreen() {
  const user = useAuthStore((s) => s.user);
  const [passType, setPassType] = useState<"visitor" | "delivery">("visitor");
  const [visitorName, setVisitorName] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [hasVehicle, setHasVehicle] = useState(false);
  const [plateNo, setPlateNo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPass, setGeneratedPass] = useState<{
    label: string;
    passType: "visitor" | "delivery";
    qrToken: string;
    guestUrl?: string;
  } | null>(null);

  async function sharePass() {
    if (!generatedPass) return;

    const guestLinkLine = generatedPass.guestUrl
      ? `\n\nGuest web pass (no app):\n${generatedPass.guestUrl}`
      : "";

    await Share.share({
      message: `${generatedPass.passType === "visitor" ? "Visitor" : "Delivery"} pass for ${generatedPass.label}\n\nQR token:\n${generatedPass.qrToken}${guestLinkLine}\n\nGuest can just show the QR image or screenshot at the gate.`,
    });
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

      const res = await api.createPass({
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
      });

      if (res.ok && res.qrToken) {
        setGeneratedPass({
          label:
            passType === "visitor" ? visitorName.trim() : deliveryType.trim(),
          passType,
          qrToken: res.qrToken,
          guestUrl: res.guestUrl,
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
      Alert.alert("Error", "Could not create pass. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <AppText style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        Create Visitor or Delivery Pass
      </AppText>

      <AppText style={{ marginBottom: 16 }}>
        Resident creates the pass, then shares the QR image/screenshot or guest
        web link directly to the visitor or delivery rider.
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
            borderColor: "#e5e7eb",
            borderRadius: 16,
            borderWidth: 1,
            marginTop: 24,
            padding: 16,
          }}
        >
          <AppText style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
            Ready to Share
          </AppText>
          <AppText style={{ marginBottom: 16 }}>
            {generatedPass.passType === "visitor" ? "Visitor" : "Delivery"}:{" "}
            {generatedPass.label}
          </AppText>
          <QRCode value={generatedPass.qrToken} size={220} />
          <AppText style={{ marginVertical: 16, textAlign: "center" }}>
            Ask the guest to present this QR at the gate. They can also show a
            screenshot or open the guest web link.
          </AppText>
          <AppButton title="Share Pass" onPress={sharePass} />
          <View style={{ height: 10 }} />
          <AppButton title="Share Guest Link" onPress={shareGuestLink} />
          <View style={{ height: 10 }} />
          <AppButton title="Open Guest Link" onPress={openGuestLink} />
        </View>
      ) : null}
    </Screen>
  );
}
