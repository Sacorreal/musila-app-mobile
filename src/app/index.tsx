import { Redirect } from 'expo-router';

import { useAuthStore } from '@/shared/stores/auth.store';

export default function RootIndex() {
  const { isAuthenticated, isHydrated } = useAuthStore();

  if (!isHydrated) return null;

  return <Redirect href={isAuthenticated ? '/(app)/home' : '/(auth)/login'} />;
}
