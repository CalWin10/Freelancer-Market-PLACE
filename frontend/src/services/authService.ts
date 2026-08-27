import api from "./api";

export type UserRole = "ADMIN" | "CLIENT" | "FREELANCER";

export interface AuthResponse {
  token: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  fullName: string;
  role: Exclude<UserRole, "ADMIN">;
}

export const login = (request: LoginRequest): Promise<AuthResponse> =>
  api.post<AuthResponse>("/auth/login", request).then((response) => response.data);

export const register = (request: RegisterRequest): Promise<AuthResponse> =>
  api.post<AuthResponse>("/auth/register", request).then((response) => response.data);

export const forgotPassword = (email: string): Promise<string> =>
  api.post<string>("/auth/forgot-password", { email }).then((response) => response.data);

export const resetPassword = (token: string, newPassword: string): Promise<string> =>
  api
    .post<string>("/auth/reset-password", { token, newPassword })
    .then((response) => response.data);
