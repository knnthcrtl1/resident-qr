import type { ValidateScanResponse, User } from "@qr/types";
import axios from "axios";

type ApiConfig = { baseUrl: string; token?: string };
let config: ApiConfig = { baseUrl: "http://192.168.1.43:8000/api" };

const client = axios.create({
  baseURL: config.baseUrl,
});

export const setAuthToken = (token: string) => {
  client.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export function setApiConfig(next: ApiConfig) {
  config = next;
  client.defaults.baseURL = config.baseUrl;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers || {}),
  };

  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  }

  const response = await client({
    method: init?.method || "GET",
    url: path,
    headers,
    data: init?.body ? JSON.parse(init.body) : undefined,
    validateStatus: () => true, // Don't throw on any status code
  });

  const data = response.data as any;

  // Normalize backend envelopes so consumers can rely on `ok`.
  if (data && typeof data === "object" && data.ok === undefined) {
    if (typeof data.success === "boolean") {
      data.ok = data.success;
    }
  }

  return data as T;
}

function createIdempotencyKey() {
  const maybeCrypto = globalThis.crypto as
    | { randomUUID?: () => string }
    | undefined;
  if (maybeCrypto?.randomUUID) return maybeCrypto.randomUUID();
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const api = {
  login: (emailOrPhone: string, password: string) =>
    request<{ ok: boolean; user?: User; token?: string; message?: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ emailOrPhone, password }),
      },
    ),

  issueResidentToken: (user_id: number) =>
    request<{ ok: boolean; qrToken: string; expiresIn: number }>(
      "/resident/token",
      {
        method: "POST",
        body: JSON.stringify({ user_id }),
      },
    ),

  createPass: (payload: any) => {
    const { idempotencyKey, ...bodyPayload } = payload ?? {};
    const key = idempotencyKey || createIdempotencyKey();

    return request<{
      ok: boolean;
      pass?: any;
      qrToken?: string;
      message?: string;
    }>("/passes", {
      method: "POST",
      headers: {
        "X-Idempotency-Key": key,
      },
      body: JSON.stringify(bodyPayload),
    });
  },

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
