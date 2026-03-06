import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { api } from "@qr/api";

export default function Home() {
  const [token, setToken] = useState("");

  async function refresh() {
    // temporary hardcode user_id for testing
    const res = await api.issueResidentToken(1);
    if (res.ok) setToken(res.qrToken);
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <Text style={{ fontSize: 18, marginBottom: 12 }}>
        Resident Rotating QR
      </Text>
      {token ? <QRCode value={token} size={240} /> : <Text>Loading...</Text>}
      <View style={{ height: 16 }} />
      <Button title="Refresh" onPress={refresh} />
    </View>
  );
}
