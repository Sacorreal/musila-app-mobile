import { api } from "@/shared/libs/api";
import type { AuthResponse, LoginPayload } from "../types/auth.types";

export const loginAction = async (dto: LoginPayload): Promise<string> => {
  const { data } = await api.post<AuthResponse>("/auth", dto);
  return data.access_token;
};

export const refreshTokenAction = async (): Promise<string> => {
  const { data } = await api.post<AuthResponse>("/auth/refresh");
  return data.access_token;
};
