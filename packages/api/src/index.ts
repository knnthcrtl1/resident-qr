import type {
  CreatePassPayload,
  CreatePassResponse,
  IssueResidentTokenResponse,
  LoginResponse,
  ValidateScanPayload,
  ValidateScanResponse,
} from "@qr/types";
import axios from "axios";
import { resolveApiBaseUrl } from "./config";

type ApiConfig = { baseUrl: string };
type ApiRequestInit = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
};

let config: ApiConfig = { baseUrl: resolveApiBaseUrl() };

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

async function request<T>(path: string, init?: ApiRequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers || {}),
  };

  const response = await client({
    method: init?.method || "GET",
    url: path,
    headers,
    data: init?.body ?? undefined,
    validateStatus: () => true, // Don't throw on any status code
  });

  const data = response.data as Record<string, unknown>;

  // Normalize backend envelopes so consumers can rely on `ok`.
  if (data.ok === undefined && typeof data.success === "boolean") {
    data.ok = data.success;
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
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: { emailOrPhone, password },
    }),

  issueResidentToken: (user_id: number) =>
    request<IssueResidentTokenResponse>("/resident/token", {
      method: "POST",
      body: { user_id },
    }),

  createPass: (payload: CreatePassPayload) => {
    const { idempotencyKey, ...bodyPayload } = payload ?? {};
    const key = idempotencyKey || createIdempotencyKey();

    return request<CreatePassResponse>("/passes", {
      method: "POST",
      headers: {
        "X-Idempotency-Key": key,
      },
      body: bodyPayload,
    });
  },

  validateScan: (payload: ValidateScanPayload) =>
    request<ValidateScanResponse>("/scans/validate", {
      method: "POST",
      body: payload,
    }),
};

export * from "./errors";
export * from "./config";
