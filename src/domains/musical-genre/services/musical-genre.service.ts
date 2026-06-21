import { api } from '@/shared/libs/api';
import { apiURLs } from '@/shared/constants/urls';
import type { MusicalGenreDto } from '../types/musical-genre.types';

interface GenresApiResponse {
  data: MusicalGenreDto[];
  total: number;
}

export const musicalGenreService = {
  async getGenres(): Promise<MusicalGenreDto[]> {
    const { data } = await api.get<GenresApiResponse>(apiURLs.musicalGenre.base);
    return Array.isArray(data.data) ? data.data : (Array.isArray(data as any) ? (data as any) : []);
  },

  async getGenreById(id: string): Promise<MusicalGenreDto> {
    const { data } = await api.get<MusicalGenreDto>(apiURLs.musicalGenre.byId(id));
    return data;
  },
};
