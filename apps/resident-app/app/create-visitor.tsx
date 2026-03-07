import React, { useState } from "react";
import { Alert, Switch, TextInput } from "react-native";
import { api } from "@qr/api";
import { useAuthStore } from "@qr/store";
import { Screen, AppButton, AppText } from "@qr/ui";

export default function CreateVisitorScreen() {
  const user = useAuthStore((s) => s.user);
  const [visitorName, setVisitorName] = useState("");
  const [hasVehicle, setHasVehicle] = useState(false);
  const [plateNo, setPlateNo] = useState("");

  async function onCreate() {
    if (!user) {
      Alert.alert("Error", "Please login first");
      return;
    }

    const now = new Date();
    const later = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const res = await api.createPass({
      pass_type: "visitor",
      household_id: 1,
      issued_by_user_id: user.id,
      visitor_name: visitorName,
      has_vehicle: hasVehicle,
      plate_no: hasVehicle ? plateNo : "",
      valid_from: now.toISOString(),
      valid_until: later.toISOString(),
    });

    if (res.ok) {
      Alert.alert("Success", "Visitor pass created");
    } else {
      Alert.alert("Error", res.message || "Could not create pass");
    }
  }

  return (
    <Screen>
      <AppText style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        Create Visitor Pass
      </AppText>

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

      <AppButton title="Create Pass" onPress={onCreate} />
    </Screen>
  );
}
