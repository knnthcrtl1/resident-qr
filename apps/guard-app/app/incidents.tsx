import React from "react";
import { Screen, AppText } from "@qr/ui";

export default function IncidentsScreen() {
  return (
    <Screen>
      <AppText style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        Incidents
      </AppText>
      <AppText>Incident reports will appear here.</AppText>
    </Screen>
  );
}
