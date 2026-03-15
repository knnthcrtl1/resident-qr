import { Stack } from "expo-router";
import { resolveApiBaseUrl, setApiConfig } from "@qr/api";

setApiConfig({ baseUrl: resolveApiBaseUrl() });

export default function Layout() {
  return <Stack />;
}
