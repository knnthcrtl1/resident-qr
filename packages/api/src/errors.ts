import axios from "axios";

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

export type ApiErrorInfo = {
  message: string;
  status?: number;
  errors?: Record<string, string[] | string>;
};

export function normalizeApiError(
  error: unknown,
  fallbackMessage = "Request failed. Please try again.",
): ApiErrorInfo {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = (error.response?.data as ApiErrorBody | undefined) ?? {};

    return {
      status,
      message: data.message || error.message || fallbackMessage,
      errors: data.errors,
    };
  }

  if (error instanceof Error) {
    return { message: error.message || fallbackMessage };
  }

  return { message: fallbackMessage };
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "Request failed. Please try again.",
): string {
  return normalizeApiError(error, fallbackMessage).message;
}
