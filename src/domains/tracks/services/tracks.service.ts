import { api } from '@/shared/libs/api';
import { apiURLs } from '@/shared/constants/urls';
import type {
  CreateTrackInput,
  LanguageDto,
  PaginatedTracksResponse,
  TracksResponseDto,
} from '../types/tracks.types';

export const tracksService = {
  async getMyAuthorTracks(): Promise<TracksResponseDto[]> {
    const { data } = await api.get<PaginatedTracksResponse>(apiURLs.tracks.myTracks);
    return Array.isArray(data.data) ? data.data : [];
  },

  async getMyTracks(): Promise<TracksResponseDto[]> {
    const { data } = await api.get<PaginatedTracksResponse>(apiURLs.tracks.me);
    return Array.isArray(data.data) ? data.data : [];
  },

  async getFeaturedTracks(): Promise<TracksResponseDto[]> {
    const { data } = await api.get<PaginatedTracksResponse>(apiURLs.tracks.base, {
      params: { limit: 20 },
    });
    return Array.isArray(data.data) ? data.data : [];
  },

  async getTrackById(id: string): Promise<TracksResponseDto> {
    const { data } = await api.get<TracksResponseDto>(apiURLs.tracks.byId(id));
    return data;
  },

  async createTrack(input: CreateTrackInput): Promise<TracksResponseDto> {
    const { data } = await api.post<TracksResponseDto>(apiURLs.tracks.base, input);
    return data;
  },

  async getLanguages(): Promise<LanguageDto[]> {
    const { data } = await api.get<LanguageDto[]>(apiURLs.languages.base);
    return Array.isArray(data) ? data : [];
  },
};
