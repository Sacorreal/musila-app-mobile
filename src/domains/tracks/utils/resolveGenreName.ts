import type { TrackGenre } from '../types/tracks.types';

export function resolveGenreName(genre: TrackGenre | undefined | null): string {
  if (!genre) return '';
  if (typeof genre === 'string') return genre;
  return genre.genre ?? '';
}
