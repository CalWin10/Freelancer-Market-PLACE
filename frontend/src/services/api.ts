import axios, { AxiosError } from "axios";
import { API_BASE_URL, resolveAssetUrl } from "../config/env";
import { AUTH_TOKEN_KEY } from "../utils/auth";

export const AUTH_UNAUTHORIZED_EVENT = "freelancer:unauthorized";

export interface ApiErrorBody {
  status?: number;
  message?: string;
  errors?: Record<string, unknown>;
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "Please check the information you entered.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested record could not be found.",
  409: "This action conflicts with the current record state.",
  422: "This action is not available in the current state.",
  500: "The server encountered a problem. Please try again.",
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const requestUrl = String(err.config?.url ?? "");
    const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");
    const hadToken = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));

    if (err.response?.status === 401 && hadToken && !isAuthRequest) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }
    return Promise.reject(err);
  }
);

export const getApiErrorBody = (error: unknown): ApiErrorBody | null => {
  if (!axios.isAxiosError(error)) return null;
  const data = (error as AxiosError).response?.data;
  if (typeof data === "string") return { message: data };
  if (data && typeof data === "object") return data as ApiErrorBody;
  return null;
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  const body = getApiErrorBody(error);
  if (body?.message) return body.message;

  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") return "The request timed out. Please try again.";
    if (!error.response) return "Unable to reach the server. Check your connection and try again.";
    if (error.response.status in STATUS_MESSAGES) return STATUS_MESSAGES[error.response.status];
  }

  return fallback;
};

export const getApiFieldErrors = (error: unknown): Record<string, string> => {
  const errors = getApiErrorBody(error)?.errors;
  if (!errors) return {};

  return Object.entries(errors).reduce<Record<string, string>>((result, [field, value]) => {
    if (typeof value === "string") result[field] = value;
    if (Array.isArray(value)) {
      const firstMessage = value.find((item) => typeof item === "string");
      if (typeof firstMessage === "string") result[field] = firstMessage;
    }
    return result;
  }, {});
};

export const getApiStatus = (error: unknown) =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

export const compactParams = <T extends object>(params: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null),
  ) as Partial<T>;

export const fetchProtectedAsset = async (path: string, signal?: AbortSignal) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await axios.get<Blob>(resolveAssetUrl(path), {
    responseType: "blob",
    signal,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
};

export default api;
