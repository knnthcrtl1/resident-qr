import type { ValidateScanResponse } from "@qr/types";

export type ApiConfig = { baseUrl: string };

let config: ApiConfig = { baseUrl: "" };

export function setApiConfig(next: ApiConfig) {
  config = next;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${config.baseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  return res.json();
}

export const api = {
  login: (emailOrPhone: string, password: string) =>
    request<{ ok: boolean; user?: any; message?: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ emailOrPhone, password }),
    }),

  registerResident: (payload: any) =>
    request<{ ok: boolean; message?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createPass: (payload: any) =>
    request<{ ok: boolean; pass?: any; qrToken?: string; message?: string }>(
      "/passes",
      { method: "POST", body: JSON.stringify(payload) },
    ),

  issueResidentToken: (user_id: number) =>
    request<{ ok: boolean; qrToken: string; expiresIn: number }>(
      "/resident/token",
      {
        method: "POST",
        body: JSON.stringify({ user_id }),
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
