import type { TracksResponseDto } from '@/domains/tracks/types/tracks.types';
import type { Track } from '@/shared/stores/player.store';
import { formatFullName } from '@/shared/utils/formatName';

export function mapToPlayerTrack(track: TracksResponseDto): Track {
  const artist = Array.isArray(track.authors)
    ? track.authors
        .map((a) => (typeof a === 'string' ? a : formatFullName(a.name, a.lastName)))
        .join(', ')
    : '';
  return {
    id: track.id,
    title: track.title,
    artist,
    albumArt: track.coverUrl ?? undefined,
    audioUrl: track.audioUrl ?? '',
    duration: 0,
  };
}
