import { useEffect } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@qr/store";
import type { UserRole } from "@qr/types";

type UseRoleRouteAccessOptions = {
  allowedRoles: UserRole[];
  loginMessage: string;
  accessDeniedMessage: string;
  loginRoute?: string;
  fallbackRoute?: string;
  allowMissingRole?: boolean;
};

export function useRoleRouteAccess(options: UseRoleRouteAccessOptions) {
  const user = useAuthStore((s) => s.user);
  const canAccess =
    !!user &&
    (options.allowMissingRole
      ? !user.role || options.allowedRoles.includes(user.role)
      : !!user.role && options.allowedRoles.includes(user.role));

  useEffect(() => {
    if (!user) {
      Alert.alert("Login required", options.loginMessage, [
        {
          text: "Go to Login",
          onPress: () => router.replace(options.loginRoute ?? "/login"),
        },
      ]);
      return;
    }

    if (!canAccess) {
      Alert.alert("Access denied", options.accessDeniedMessage, [
        {
          text: "Back",
          onPress: () => router.replace(options.fallbackRoute ?? "/"),
        },
      ]);
    }
  }, [
    canAccess,
    options.accessDeniedMessage,
    options.fallbackRoute,
    options.loginMessage,
    options.loginRoute,
    user,
  ]);

  return { user, canAccess };
}
