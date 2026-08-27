export const AUTH_TOKEN_KEY = "token";

export type UserRole = "CLIENT" | "FREELANCER" | "ADMIN";

export interface JwtPayload {
  sub: string;
  role: UserRole;
  exp?: number;
  iat?: number;
}

export interface AuthUser {
  email: string;
  role: UserRole;
  expiresAt?: number;
}

const VALID_ROLES: readonly UserRole[] = ["CLIENT", "FREELANCER", "ADMIN"];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && VALID_ROLES.includes(value as UserRole);
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = window.atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function parseJwt(token: string): JwtPayload | null {
  if (!token || typeof window === "undefined") return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;

    const payload: unknown = JSON.parse(decodeBase64Url(parts[1]));
    if (!payload || typeof payload !== "object") return null;

    const claims = payload as Record<string, unknown>;
    if (typeof claims.sub !== "string" || !isUserRole(claims.role)) return null;
    if (claims.exp !== undefined && typeof claims.exp !== "number") return null;
    if (claims.iat !== undefined && typeof claims.iat !== "number") return null;

    return {
      sub: claims.sub,
      role: claims.role,
      exp: claims.exp,
      iat: claims.iat,
    };
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, clockSkewSeconds = 10): boolean {
  const payload = parseJwt(token);
  if (!payload) return true;
  if (!payload.exp) return false;
  return payload.exp <= Math.floor(Date.now() / 1000) + clockSkewSeconds;
}

export function getUserFromToken(token: string): AuthUser | null {
  const payload = parseJwt(token);
  if (!payload || isTokenExpired(token, 0)) return null;

  return {
    email: payload.sub,
    role: payload.role,
    expiresAt: payload.exp ? payload.exp * 1000 : undefined,
  };
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function storeToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "CLIENT":
      return "Client";
    case "FREELANCER":
      return "Freelancer";
    case "ADMIN":
      return "Administrator";
  }
}
