import { api } from '@/shared/libs/api';
import { apiURLs } from '@/shared/constants/urls';
import type { CreatePlaylistInput, PaginatedPlaylistsResponse, Playlist } from '../types/playlists.types';

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
};
