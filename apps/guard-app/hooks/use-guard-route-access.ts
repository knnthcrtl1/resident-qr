import { useRoleRouteAccess } from "@qr/ui";

export function useGuardRouteAccess() {
  return useRoleRouteAccess({
    allowedRoles: ["guard", "admin"],
    allowMissingRole: true,
    loginMessage: "Please login as guard/admin first.",
    accessDeniedMessage: "Only guard or admin accounts can use this screen.",
  });
}
