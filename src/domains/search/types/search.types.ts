import type { TracksResponseDto } from '@/domains/tracks/types/tracks.types';

export type SearchResult = TracksResponseDto;

export interface SearchAuthorDto {
  id: string;
  name: string;
  lastName?: string;
  avatarUrl?: string;
  role: string;
}

export interface SearchGenreDto {
  id: string;
  genre: string;
  subGenre?: string[];
  slug?: string;
}

export interface SearchMeta {
  limit: number;
  tracksTotal: number;
  genresTotal: number;
  authorsTotal: number;
  hasMoreTracks: boolean;
  hasMoreAuthors: boolean;
  hasMoreGenres: boolean;
}

export interface SearchResponse {
  tracks: TracksResponseDto[];
  musicalGenres: SearchGenreDto[];
  authors: SearchAuthorDto[];
  meta: SearchMeta;
}

export type SearchSectionKey = 'tracks' | 'authors' | 'genres';

export type SearchListItem =
  | { kind: 'header'; section: SearchSectionKey; label: string }
  | { kind: 'track'; section: 'tracks'; data: TracksResponseDto }
  | { kind: 'author'; section: 'authors'; data: SearchAuthorDto }
  | { kind: 'genre'; section: 'genres'; data: SearchGenreDto }
  | { kind: 'see-all'; section: SearchSectionKey; label: string; total: number };
