import { TracksResponseDto } from '@/domains/tracks/types/tracks.types';

export interface MusicalGenreDto {
  id: string;
  genre: string;
  slug: string;
  subGenre?: string[];
  tracks?: TracksResponseDto[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
