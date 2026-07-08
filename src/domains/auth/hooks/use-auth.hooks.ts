import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/useAuthStore";
import type { LoginSchema } from "../validations/auth.schema";

export const useLogin = () => {
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  return useMutation({
    mutationFn: (values: LoginSchema) => login(values),
    onSuccess: () => {
      router.replace("/(tabs)" as any);
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      router.replace("/(auth)/login" as any);
    },
  });
};