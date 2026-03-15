import { useRoleRouteAccess } from "@qr/ui";

export function useResidentRouteAccess() {
  return useRoleRouteAccess({
    allowedRoles: ["resident"],
    allowMissingRole: true,
    loginMessage: "Please login as resident first.",
    accessDeniedMessage: "Only resident accounts can use this screen.",
  });
}
