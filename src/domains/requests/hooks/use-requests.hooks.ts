import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestsService } from '../services/requests.service';
import type { RequestStatus } from '../types/requests.types';

export function useRequests() {
  return useQuery({
    queryKey: ['requests'],
    queryFn: () => requestsService.getRequests(),
  });
}

export function useUpdateRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      requestsService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}
