import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';
import { requestsService } from '../services/requests.service';
import { getReceivedRequests, getReceivedRequestsBadgeCount } from '../libs/requests.utils';
import type { CreateRequestedTrackInput, RequestStatus } from '../types/requests.types';

export function useRequests(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['requests'],
    queryFn: () => requestsService.getRequests(),
    enabled: options?.enabled ?? true,
  });
}

export function useReceivedRequestsBadgeCount(enabled = true) {
  const user = useAuthStore((s) => s.user);
  const { data: requests = [] } = useRequests({ enabled });

  return useMemo(() => {
    const received = getReceivedRequests(requests, user?.id, user?.role);
    return getReceivedRequestsBadgeCount(received);
  }, [requests, user?.id, user?.role]);
}

export function useUpdateRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      documentUrl,
    }: {
      id: string;
      status: RequestStatus;
      documentUrl?: string;
    }) => requestsService.updateStatus(id, { status, documentUrl }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRequestedTrackInput) => requestsService.createRequestedTrack(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: ['plan', 'me'] });
    },
  });
}
