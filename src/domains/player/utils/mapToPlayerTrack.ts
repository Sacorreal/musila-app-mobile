import type { TracksResponseDto } from '@/domains/tracks/types/tracks.types';
import type { Track } from '@/shared/stores/player.store';

export function mapToPlayerTrack(track: TracksResponseDto): Track {
  const artist = (track.authors as any[])
    .map((a) => (typeof a === 'string' ? a : `${a.name} ${a.lastName}`))
    .join(', ');
  return {
    id: track.id,
    title: track.title,
    artist,
    albumArt: track.coverUrl ?? undefined,
    audioUrl: track.audioUrl ?? '',
    duration: 0,
  };
}
