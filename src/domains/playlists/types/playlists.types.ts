import { TracksResponseDto } from '@/domains/tracks/types/tracks.types';
import type { PlaylistCollaborator } from './playlist-collaborator.types';

export interface PlaylistOwner {
  id: string;
  name: string;
  lastName: string;
}

export interface Playlist {
  id: string;
  title: string;
  cover?: string | null;
  tracks?: TracksResponseDto[];
  owner?: PlaylistOwner;
  collaborators?: PlaylistCollaborator[];
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
