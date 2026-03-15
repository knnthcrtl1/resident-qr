import React from "react";
import { Screen, AppText } from "@qr/ui";
import { useResidentRouteAccess } from "../hooks/use-resident-route-access";

export default function HistoryScreen() {
  useResidentRouteAccess();

  return (
    <Screen>
      <AppText
        style={{
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 1.2,
          color: "#7c6f64",
        }}
      >
        ACTIVITY
      </AppText>
      <AppText style={{ fontSize: 26, fontWeight: "700", marginBottom: 8 }}>
        Pass history will appear here.
      </AppText>
      <AppText style={{ color: "#4b5563" }}>
        This screen can later show recent visitor and delivery passes, scan
        outcomes, and expiry status.
      </AppText>
    </Screen>
  );
}
