import type { ValidateScanResponse } from "@qr/types";

type ApiConfig = { baseUrl: string };
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
