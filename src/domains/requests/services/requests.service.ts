import { api } from '@/shared/libs/api';
import { apiURLs } from '@/shared/constants/urls';
import type { PaginatedRequestsResponse, RequestStatus, TrackRequest } from '../types/requests.types';

export const requestsService = {
  async getRequests(): Promise<TrackRequest[]> {
    const { data } = await api.get<PaginatedRequestsResponse>(apiURLs.requestedTracks.base);
    return Array.isArray(data.data) ? data.data : [];
  },

  async getRequestById(id: string): Promise<TrackRequest> {
    const { data } = await api.get<TrackRequest>(apiURLs.requestedTracks.byId(id));
    return data;
  },

  async updateStatus(id: string, status: RequestStatus): Promise<TrackRequest> {
    const { data } = await api.put<TrackRequest>(apiURLs.requestedTracks.byId(id), { status });
    return data;
  },
};
