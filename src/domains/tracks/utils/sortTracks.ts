import type { TracksResponseDto } from '../types/tracks.types';

export function sortByNewest<T extends Pick<TracksResponseDto, 'createdAt'>>(tracks: T[]): T[] {
  return [...tracks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
