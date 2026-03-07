import React from "react";
import { Screen, AppText } from "@qr/ui";

export default function HistoryScreen() {
  return (
    <Screen>
      <AppText style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        History
      </AppText>
      <AppText>Resident and visitor logs will appear here.</AppText>
    </Screen>
  );
}
