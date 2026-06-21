import { TracksResponseDto } from '@/domains/tracks/types/tracks.types';

export interface Playlist {
  id: string;
  title: string;
  cover?: string | null;
  tracks?: TracksResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlaylistInput {
  title: string;
}

export interface UpdatePlaylistInput {
  title?: string;
  cover?: string;
  trackIds?: string[];
}

export interface PaginatedPlaylistsResponse {
  data: Playlist[];
  meta: {
    page: number;
    take: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
