import type { TracksResponseDto } from '@/domains/tracks/types/tracks.types';
import { usePlayerStore } from '@/shared/stores/player.store';
import { mapToPlayerTrack } from './mapToPlayerTrack';

export function playTracks(tracks: TracksResponseDto[], startIndex = 0): void {
  const playable = tracks.filter((t) => !!t.audioUrl);
  if (playable.length === 0) return;

  const targetId = tracks[startIndex]?.id;
  const index = Math.max(
    playable.findIndex((t) => t.id === targetId),
    0,
  );

  const { clearQueue, addToQueue, setTrack } = usePlayerStore.getState();

  clearQueue();
  playable.slice(index + 1).forEach((t) => addToQueue(mapToPlayerTrack(t)));
  setTrack(mapToPlayerTrack(playable[index]));
}
