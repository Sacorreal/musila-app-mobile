import { TracksResponseDto } from '@/domains/tracks/types/tracks.types';

export type SearchResult = TracksResponseDto;

export interface SearchResponse {
  data: SearchResult[];
  total: number;
}
