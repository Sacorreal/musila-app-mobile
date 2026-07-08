import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tracksService } from '../services/tracks.service';
import type { CreateTrackInput, UpdateTrackInput } from '../types/tracks.types';

export function useMyAuthorTracks() {
  return useQuery({
    queryKey: ['tracks', 'my-tracks'],
    queryFn: () => tracksService.getMyAuthorTracks(),
  });
}

export function useMyTracks() {
  return useQuery({
    queryKey: ['tracks', 'me'],
    queryFn: () => tracksService.getMyTracks(),
  });
}

export function useFeaturedTracks() {
  return useQuery({
    queryKey: ['tracks', 'featured'],
    queryFn: () => tracksService.getFeaturedTracks(),
  });
}

export function useTrackById(id: string) {
  return useQuery({
    queryKey: ['tracks', id],
    queryFn: () => tracksService.getTrackById(id),
    enabled: !!id,
  });
}

export function useCreateTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTrackInput) => tracksService.createTrack(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tracks'] });
      qc.invalidateQueries({ queryKey: ['plan', 'me'] });
    },
  });
}

export function useLanguages() {
  return useQuery({
    queryKey: ['languages'],
    queryFn: () => tracksService.getLanguages(),
  });
}

export function useUpdateTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTrackInput;
    }) => tracksService.update(id, data),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['tracks'],
        }),

        queryClient.invalidateQueries({
          queryKey: ['tracks', 'my-tracks'],
        }),

        queryClient.invalidateQueries({
          queryKey: ['tracks', 'me'],
        }),
      ]);
    },
  });
}
