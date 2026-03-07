import type { ValidateScanResponse, User } from "@qr/types";

type ApiConfig = { baseUrl: string; token?: string };
let config: ApiConfig = { baseUrl: "" };

export function setApiConfig(next: ApiConfig) {
  config = next;
}

export function setAuthToken(token: string | null) {
  config.token = token || undefined;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers || {}),
  };

  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  }

  const res = await fetch(`${config.baseUrl}${path}`, {
    headers,
    ...init,
  });
  return res.json();
}

export const api = {
  login: (emailOrPhone: string, password: string) =>
    request<{ ok: boolean; user?: User; message?: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ emailOrPhone, password }),
    }),

  issueResidentToken: (user_id: number) =>
    request<{ ok: boolean; qrToken: string; expiresIn: number }>(
      "/resident/token",
      {
        method: "POST",
        body: JSON.stringify({ user_id }),
      },
    ),

  createPass: (payload: any) =>
    request<{ ok: boolean; pass?: any; qrToken?: string; message?: string }>(
      "/passes",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  validateScan: (payload: {
    token: string;
    guard_user_id: number;
    gate: string;
    direction: string;
    note?: string;
  }) =>
    request<ValidateScanResponse>("/scans/validate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
