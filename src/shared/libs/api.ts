import { create } from 'axios';
import * as SecureStore from "expo-secure-store";
import { usePlanLimitStore } from '../stores/planLimit.store';
import { isPlanLimitError } from '../utils/planLimitError';


const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://musila-api-development.up.railway.app';

export const api = create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

api.interceptors.request.use(async (config) => {
 const token = await SecureStore.getItemAsync("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("access_token");
    }
    if (isPlanLimitError(error)) {
      const { resource, limit, current } = error.response!.data;
      usePlanLimitStore.getState().showLimit({ resource, limit, current });
    }
    return Promise.reject(error);
  }
);
