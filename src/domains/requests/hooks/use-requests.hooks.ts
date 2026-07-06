import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestsService } from '../services/requests.service';
import type { CreateRequestedTrackInput, RequestStatus } from '../types/requests.types';

export function useRequests() {
  return useQuery({
    queryKey: ['requests'],
    queryFn: () => requestsService.getRequests(),
  });
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
    },
  });
}
