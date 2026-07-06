import { usePlayerStore } from '@/shared/stores/player.store';
import { MINI_PLAYER_HEIGHT } from '../components/MiniPlayer';

const MINI_PLAYER_MARGIN = 24;

export function useMiniPlayerSpacing(): number {
  const hasTrack = usePlayerStore((s) => !!s.currentTrack);
  return hasTrack ? MINI_PLAYER_HEIGHT + MINI_PLAYER_MARGIN : 0;
}
