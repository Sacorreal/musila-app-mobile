import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

import { decodeToken } from "@/domains/auth/libs/decodeToken";
import { loginAction } from "@/domains/auth/services/auth.service";
import type { AuthUser, LoginPayload } from "../types/auth.types";

type AuthState = {
  user?: AuthUser;
  token?: string;
  isLoading: boolean;

  login: (dto: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: undefined,
  token: undefined,
  isLoading: true,

  login: async (dto: LoginPayload) => {
    const token = await loginAction(dto);
    const decoded = decodeToken(token);

    const user: AuthUser = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
      plan: decoded.plan,
    };

    await SecureStore.setItemAsync("access_token", token);
    set({ token, user });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("access_token");
    set({ token: undefined, user: undefined });
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync("access_token");

      if (!token) {
        set({ isLoading: false });
        return;
      }

      const decoded = decodeToken(token);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        await SecureStore.deleteItemAsync("access_token");
        set({ isLoading: false });
        return;
      }

      const user: AuthUser = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name,
        plan: decoded.plan,
      };

      set({ token, user, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
