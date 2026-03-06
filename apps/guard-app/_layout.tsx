import { Stack } from "expo-router";
import { setApiConfig } from "@qr/api";

setApiConfig({ baseUrl: "http://YOUR_SERVER_IP:8000/api" });

export default function Layout() {
  return <Stack />;
}
