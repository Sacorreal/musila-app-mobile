import { api } from '@/shared/libs/api';
import { apiURLs } from '@/shared/constants/urls';
import type {
  CreateInviteInput,
  InviteResponse,
  PaginatedGuestsResponse,
} from '../types/guests.types';

export const guestsService = {
  async getGuests(limit = 100, offset = 0): Promise<PaginatedGuestsResponse> {
    const { data } = await api.get<PaginatedGuestsResponse>(apiURLs.guests.base, {
      params: { limit, offset },
    });
    return data;
  },

  async createInvite(input: CreateInviteInput): Promise<InviteResponse> {
    const { data } = await api.post<InviteResponse>(apiURLs.invites.base, input);
    return data;
  },
};
