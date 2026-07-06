import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface RecentSearchEntry {
  id: string;
  query: string;
  timestamp: number;
}

const MAX_RECENT_SEARCHES = 10;

interface RecentSearchesState {
  entries: RecentSearchEntry[];
  addSearch: (query: string) => void;
  removeSearch: (id: string) => void;
  clearAll: () => void;
}

export const useRecentSearchesStore = create<RecentSearchesState>()(
  persist(
    (set, get) => ({
      entries: [],

      addSearch: (query: string) => {
        const trimmed = query.trim();
        if (trimmed.length < 2) return;

        const normalized = trimmed.toLowerCase();
        const withoutDuplicate = get().entries.filter(
          (entry) => entry.query.toLowerCase() !== normalized,
        );

        const nextEntry: RecentSearchEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          query: trimmed,
          timestamp: Date.now(),
        };

        set({ entries: [nextEntry, ...withoutDuplicate].slice(0, MAX_RECENT_SEARCHES) });
      },

      removeSearch: (id: string) => {
        set({ entries: get().entries.filter((entry) => entry.id !== id) });
      },

      clearAll: () => set({ entries: [] }),
    }),
    {
      name: 'musila:recent-searches',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
