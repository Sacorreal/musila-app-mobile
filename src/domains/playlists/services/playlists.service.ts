import { api } from '@/shared/libs/api';
import { apiURLs } from '@/shared/constants/urls';
import type {
  CreatePlaylistInput,
  PaginatedPlaylistsResponse,
  Playlist,
  UpdatePlaylistInput,
} from '../types/playlists.types';

export const playlistsService = {
  async getPlaylists(): Promise<Playlist[]> {
    const { data } = await api.get<PaginatedPlaylistsResponse>(apiURLs.playlists.base);
    return Array.isArray(data.data) ? data.data : [];
  },

  async getPlaylistById(id: string): Promise<Playlist> {
    const { data } = await api.get<Playlist>(apiURLs.playlists.byId(id));
    return data;
  },

  async createPlaylist(input: CreatePlaylistInput): Promise<Playlist> {
    const { data } = await api.post<Playlist>(apiURLs.playlists.base, input);
    return data;
  },

  async deletePlaylist(id: string): Promise<void> {
    await api.delete(apiURLs.playlists.byId(id));
  },

  async addTrack(playlistId: string, trackId: string): Promise<Playlist> {
    const current = await playlistsService.getPlaylistById(playlistId);
    const existingIds = (current.tracks ?? []).map((t) => t.id);
    if (existingIds.includes(trackId)) return current;
    const { data } = await api.put<Playlist>(apiURLs.playlists.byId(playlistId), {
      trackIds: [...existingIds, trackId],
    });
    return data;
  },

  async updatePlaylist(id: string, input: UpdatePlaylistInput): Promise<Playlist> {
    const { data } = await api.put<Playlist>(apiURLs.playlists.byId(id), input);
    return data;
  },

  async removeTrack(playlistId: string, trackId: string): Promise<Playlist> {
    const current = await playlistsService.getPlaylistById(playlistId);
    const remainingIds = (current.tracks ?? [])
      .filter((t) => t.id !== trackId)
      .map((t) => t.id);
    const { data } = await api.put<Playlist>(apiURLs.playlists.byId(playlistId), {
      trackIds: remainingIds,
    });
    return data;
  },
};
