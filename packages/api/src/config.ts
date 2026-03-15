const DEFAULT_API_BASE_URL = "http://192.168.1.43:8000/api";

export function resolveApiBaseUrl(): string {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (envBaseUrl) {
    return envBaseUrl;
  }

  return DEFAULT_API_BASE_URL;
}
