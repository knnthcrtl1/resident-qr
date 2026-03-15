import { useEffect } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@qr/store";

export function useGuardRouteAccess() {
  const user = useAuthStore((s) => s.user);
  const canAccess =
    !!user && (!user.role || user.role === "guard" || user.role === "admin");

  useEffect(() => {
    if (!user) {
      Alert.alert("Login required", "Please login as guard/admin first.", [
        { text: "Go to Login", onPress: () => router.replace("/login") },
      ]);
      return;
    }

    if (!canAccess) {
      Alert.alert(
        "Access denied",
        "Only guard or admin accounts can use this screen.",
        [{ text: "Back", onPress: () => router.replace("/") }],
      );
    }
  }, [canAccess, user]);

  return { user, canAccess };
}
