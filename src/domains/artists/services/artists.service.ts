import { api } from '@/shared/libs/api';
import { apiURLs } from '@/shared/constants/urls';
import type { ArtistDto } from '../types/artists.types';

interface ArtistsApiResponse {
  data: ArtistDto[];
  meta: { itemCount: number };
}

export const artistsService = {
  async getFeaturedArtists(limit = 10): Promise<ArtistDto[]> {
    const { data } = await api.get<ArtistsApiResponse>(apiURLs.users.authors, {
      params: { limit },
    });
    return Array.isArray(data.data) ? data.data : [];
  },

  async getArtistById(id: string): Promise<ArtistDto> {
    const { data } = await api.get<ArtistDto>(apiURLs.users.userById(id));
    return data;
  },
};
