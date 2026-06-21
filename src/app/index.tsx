import { Redirect } from 'expo-router';

import { useAuthStore } from '@/domains/auth/store/useAuthStore';

export default function RootIndex() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return null;

  return <Redirect href={(user ? '/(tabs)' : '/(auth)/login') as any} />;
}
