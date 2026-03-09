if (__DEV__) {
  global.XMLHttpRequest =
    global.originalXMLHttpRequest || global.XMLHttpRequest;
}

import { Stack } from "expo-router";

export default function Layout() {
  return <Stack screenOptions={{ headerShown: true }} />;
}
