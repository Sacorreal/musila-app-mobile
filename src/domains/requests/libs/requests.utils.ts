import { UserRole } from '@/domains/users/types/users.types';
import type { TabKey } from '@/domains/requests/components/RequestsTabBar';
import { RequestStatus, type TrackRequest } from '@/domains/requests/types/requests.types';

export function getAvailableTabs(role: UserRole | undefined): TabKey[] {
  if (role === UserRole.ADMIN || role === UserRole.CANTAUTOR) return ['enviadas', 'recibidas'];
  if (role === UserRole.AUTOR) return ['recibidas'];
  return ['enviadas'];
}

export function getSentRequests(
  requests: TrackRequest[],
  userId: string | undefined
): TrackRequest[] {
  return requests.filter((r) => r.requester?.id === userId);
}

export function getReceivedRequests(
  requests: TrackRequest[],
  userId: string | undefined,
  role: UserRole | undefined
): TrackRequest[] {
  if (role === UserRole.ADMIN) return requests.filter((r) => r.requester?.id !== userId);
  return requests.filter((r) => {
    const authors = r.track?.authors ?? [];
    return Array.isArray(authors)
      ? authors.some((a) => (typeof a === 'string' ? a : a.id) === userId)
      : false;
  });
}

export function getReceivedRequestsBadgeCount(receivedRequests: TrackRequest[]): number {
  const pendingCount = receivedRequests.filter((r) => r.status === RequestStatus.PENDIENTE).length;
  const unreadMessagesCount = receivedRequests.reduce((sum, r) => sum + (r.unreadCount ?? 0), 0);
  return pendingCount + unreadMessagesCount;
}
