const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const configuredAssetBaseUrl = import.meta.env.VITE_ASSET_BASE_URL?.trim();

/**
 * A relative fallback keeps production deployments same-origin. Local development
 * should use the values documented in .env.example.
 */
export const API_BASE_URL = trimTrailingSlash(configuredApiBaseUrl || "/api/v1");

const inferAssetBaseUrl = () => {
  if (configuredAssetBaseUrl) return trimTrailingSlash(configuredAssetBaseUrl);

  try {
    return new URL(API_BASE_URL, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
};

export const ASSET_BASE_URL = inferAssetBaseUrl();

export const resolveAssetUrl = (path?: string | null) => {
  if (!path) return "";
  if (/^(blob:|data:|https?:\/\/)/i.test(path)) return path;
  return new URL(path.startsWith("/") ? path : `/${path}`, `${ASSET_BASE_URL}/`).toString();
};
