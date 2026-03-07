import { Stack } from "expo-router";
import { setApiConfig } from "@qr/api";

setApiConfig({ baseUrl: "http://backend-resident-app.test/api" });

export default function Layout() {
  return <Stack />;
}
