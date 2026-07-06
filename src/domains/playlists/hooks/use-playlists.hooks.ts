import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { playlistsService } from '../services/playlists.service';
import type { CreatePlaylistInput, UpdatePlaylistInput } from '../types/playlists.types';

export function usePlaylists() {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: () => playlistsService.getPlaylists(),
  });
}

export function usePlaylistById(id: string) {
  return useQuery({
    queryKey: ['playlists', id],
    queryFn: () => playlistsService.getPlaylistById(id),
    enabled: !!id,
  });
}

export function useCreatePlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlaylistInput) => playlistsService.createPlaylist(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

export function useDeletePlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => playlistsService.deletePlaylist(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

export function useAddTrackToPlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, trackId }: { playlistId: string; trackId: string }) =>
      playlistsService.addTrack(playlistId, trackId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['playlists', vars.playlistId] });
      qc.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

export function useUpdatePlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePlaylistInput }) =>
      playlistsService.updatePlaylist(id, input),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['playlists', vars.id] });
      qc.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

export function useRemoveTrackFromPlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, trackId }: { playlistId: string; trackId: string }) =>
      playlistsService.removeTrack(playlistId, trackId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['playlists', vars.playlistId] });
      qc.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}
