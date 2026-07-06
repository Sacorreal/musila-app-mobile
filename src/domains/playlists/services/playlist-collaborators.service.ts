import { api } from '@/shared/libs/api';
import { apiURLs } from '@/shared/constants/urls';
import type {
  AddMultipleCollaboratorsInput,
  PlaylistCollaborator,
} from '../types/playlist-collaborator.types';

export const playlistCollaboratorsService = {
  async getCollaborators(playlistId: string): Promise<PlaylistCollaborator[]> {
    const { data } = await api.get<PlaylistCollaborator[]>(apiURLs.playlists.collaborators(playlistId));
    return Array.isArray(data) ? data : [];
  },

  async addMultipleCollaborators(
    playlistId: string,
    input: AddMultipleCollaboratorsInput,
  ): Promise<PlaylistCollaborator[]> {
    const { data } = await api.post<PlaylistCollaborator[]>(
      apiURLs.playlists.collaboratorsBulk(playlistId),
      input,
    );
    return Array.isArray(data) ? data : [];
  },

  async removeCollaborator(playlistId: string, guestId: string): Promise<void> {
    await api.delete(apiURLs.playlists.collaboratorById(playlistId, guestId));
  },
};
