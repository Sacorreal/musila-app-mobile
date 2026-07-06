import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { playlistCollaboratorsService } from '../services/playlist-collaborators.service';
import type { AddMultipleCollaboratorsInput } from '../types/playlist-collaborator.types';

export const PLAYLIST_COLLAB_QUERY_KEY = 'playlist-collaborators';

export function usePlaylistCollaborators(playlistId: string | undefined) {
  return useQuery({
    queryKey: [PLAYLIST_COLLAB_QUERY_KEY, playlistId],
    queryFn: () => playlistCollaboratorsService.getCollaborators(playlistId!),
    enabled: !!playlistId,
  });
}

export function useAddCollaborators() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      playlistId,
      data,
    }: {
      playlistId: string;
      data: AddMultipleCollaboratorsInput;
    }) => playlistCollaboratorsService.addMultipleCollaborators(playlistId, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [PLAYLIST_COLLAB_QUERY_KEY, vars.playlistId] });
      qc.invalidateQueries({ queryKey: ['playlists', vars.playlistId] });
    },
  });
}

export function useRemoveCollaborator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, guestId }: { playlistId: string; guestId: string }) =>
      playlistCollaboratorsService.removeCollaborator(playlistId, guestId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [PLAYLIST_COLLAB_QUERY_KEY, vars.playlistId] });
      qc.invalidateQueries({ queryKey: ['playlists', vars.playlistId] });
    },
  });
}
