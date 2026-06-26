import { UserRole } from '@/domains/users/types/users.types';
import type { TabKey } from '@/domains/requests/components/RequestsTabBar';

export function getAvailableTabs(role: UserRole | undefined): TabKey[] {
  if (role === UserRole.ADMIN || role === UserRole.CANTAUTOR) return ['enviadas', 'recibidas'];
  if (role === UserRole.AUTOR) return ['recibidas'];
  return ['enviadas'];
}
