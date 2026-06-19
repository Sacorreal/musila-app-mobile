import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt?: string;
  audioUrl: string;
  duration: number;
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  queue: Track[];
  isExpanded: boolean;
}

interface PlayerActions {
  setTrack: (track: Track) => void;
  setPlaying: (playing: boolean) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  skipNext: () => void;
  skipPrev: () => void;
  setExpanded: (expanded: boolean) => void;
}

export const usePlayerStore = create<PlayerState & PlayerActions>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  queue: [],
  isExpanded: false,

  setTrack: (track) =>
    set({ currentTrack: track, progress: 0, isPlaying: true }),

  setPlaying: (playing) =>
    set({ isPlaying: playing }),

  setProgress: (progress) =>
    set({ progress }),

  setDuration: (duration) =>
    set({ duration }),

  addToQueue: (track) =>
    set((state) => ({ queue: [...state.queue, track] })),

  clearQueue: () =>
    set({ queue: [] }),

  skipNext: () => {
    const { queue, currentTrack } = get();
    if (!queue.length) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    const nextTrack = queue[currentIndex + 1] ?? queue[0];
    set({ currentTrack: nextTrack, progress: 0, isPlaying: true });
  },

  skipPrev: () => {
    const { queue, currentTrack, progress } = get();
    if (progress > 3) {
      set({ progress: 0 });
      return;
    }
    if (!queue.length) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    const prevTrack = queue[currentIndex - 1] ?? queue[queue.length - 1];
    set({ currentTrack: prevTrack, progress: 0, isPlaying: true });
  },

  setExpanded: (expanded) =>
    set({ isExpanded: expanded }),
}));
