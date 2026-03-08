import type { ValidateScanResponse, User } from "@qr/types";
import axios from "axios";

type ApiConfig = { baseUrl: string; token?: string };
let config: ApiConfig = { baseUrl: "http://192.168.1.43:8080/api" };

const client = axios.create({
  baseURL: config.baseUrl,
});

export const setAuthToken = (token: string) => {
  client.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export function setApiConfig(next: ApiConfig) {
  config = next;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers || {}),
  };

  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  }

  const url = `${config.baseUrl}${path}`;
  console.log(
    "Making API request to:",
    url,
    "with method:",
    init?.method || "GET",
  );

  const response = await axios({
    method: init?.method || "GET",
    url,
    headers,
    data: init?.body ? JSON.parse(init.body) : undefined,
    validateStatus: () => true, // Don't throw on any status code
  });

  console.log(
    "API response status:",
    response.status,
    "ok:",
    response.status >= 200 && response.status < 300,
  );

  return response.data;
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
