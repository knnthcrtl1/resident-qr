import { Stack } from "expo-router";
import { setApiConfig } from "@qr/api";

setApiConfig({ baseUrl: "http://192.168.1.43:8080/api" });

export default function Layout() {
  return <Stack />;
}
