import { useMutation, useQuery } from '@tanstack/react-query';
import { guestsService } from '../services/guests.service';
import type { CreateInviteInput } from '../types/guests.types';

export function useGuests(limit = 100, offset = 0) {
  return useQuery({
    queryKey: ['guests', limit, offset],
    queryFn: () => guestsService.getGuests(limit, offset),
  });
}

export function useCreateInvite() {
  return useMutation({
    mutationFn: (input: CreateInviteInput) => guestsService.createInvite(input),
  });
}
