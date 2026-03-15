import React from "react";
import { Screen, AppText } from "@qr/ui";
import { useGuardRouteAccess } from "../hooks/use-guard-route-access";

export default function IncidentsScreen() {
  useGuardRouteAccess();

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
        INCIDENT LOG
      </AppText>
      <AppText style={{ fontSize: 26, fontWeight: "700", marginBottom: 8 }}>
        Flag issues and track unusual gate events.
      </AppText>
      <AppText style={{ color: "#4b5563" }}>
        Incident reports will appear here once reporting and review tools are
        connected.
      </AppText>
    </Screen>
  );
}
