import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#183b56" },
        headerTintColor: "#fffdf7",
        headerTitleStyle: { fontWeight: "700", fontSize: 18 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#f6f3ed" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Guard Operations" }} />
      <Stack.Screen name="login" options={{ title: "Guard Sign In" }} />
      <Stack.Screen name="scan" options={{ title: "QR Scanner" }} />
      <Stack.Screen name="incidents" options={{ title: "Incidents" }} />
    </Stack>
  );
}
