import { UserRole } from '@/domains/users/types/users.types';

export interface AuthorTrackDto {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface IntellectualPropertyDto {
  id: string;
  type: 'copyrightOffice' | 'cmo' | 'splitSheet';
  key: string;
  documentKey: string;
  documentUrl: string;
  createdAt: string;
}

export interface IntellectualPropertyInput {
  type: 'copyrightOffice' | 'cmo' | 'splitSheet';
  key: string;
  documentKey: string;
  documentUrl: string;
}

export type TrackGenre = string | { id: string; genre: string; slug: string };

export interface TracksResponseDto {
  id: string;
  title: string;
  genre: TrackGenre;
  subGenre: string;
  coverUrl: string;
  audioUrl: string | null;
  year: number;
  audioKey: string;
  language: string;
  lyric: string;
  isAvailable: boolean;
  isGospel: boolean;
  coverKey: string | null;
  authors: string[] | AuthorTrackDto[];
  intellectualProperties: IntellectualPropertyDto[];
  playlists: string[];
  requestedTrack: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TrackResponse extends Omit<TracksResponseDto, 'authors'> {
  authors: AuthorTrackDto[];
}

export interface CreateTrackInput {
  title: string;
  genreId: string;
  subGenre?: string;
  language: string;
  lyric: string;
  authorsIds: string[];
  isAvailable?: boolean;
  isGospel: boolean;
  audioKey: string;
  audioUrl: string;
  coverKey?: string;
  coverUrl?: string;
  iswc?: string;
  intellectualProperties?: IntellectualPropertyInput[];
}

export enum LicenseType {
  LICENCIA_DE_PRIMER_USO = 'licencia de primer uso',
  LICENCIA_TRADUCCION = 'licencia traduccion',
}

export interface LanguageDto {
  code: string;
  label: string;
}

export interface FilterTrackInput {
  isGospel?: boolean;
  genreId?: string;
  subGenre?: string;
  language?: string;
  isAvailable?: boolean;
  page?: number;
  take?: number;
}

export interface PaginatedTracksResponse {
  data: TracksResponseDto[];
  meta: {
    page: number;
    take: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}


export type UpdateTrackInput = Partial<CreateTrackInput>;

export type AvailabilityFilter = 'all' | 'available' | 'unavailable';