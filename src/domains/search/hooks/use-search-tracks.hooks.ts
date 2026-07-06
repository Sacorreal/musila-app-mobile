import { useInfiniteQuery } from '@tanstack/react-query';
import { tracksService } from '@/domains/tracks/services/tracks.service';
import type { FilterTrackInput } from '@/domains/tracks/types/tracks.types';
import type { SearchFiltersState } from '../types/search-filters.types';

const PAGE_SIZE = 20;

export function useSearchTracks(query: string, filters: SearchFiltersState) {
  const trimmed = query.trim();
  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined);

  return useInfiniteQuery({
    queryKey: ['search', 'tracks', trimmed, filters],
    queryFn: ({ pageParam = 0 }) => {
      const params: FilterTrackInput = {
        ...filters,
        title: trimmed || undefined,
        limit: PAGE_SIZE,
        offset: pageParam,
      };
      return tracksService.searchTracks(params);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((total, page) => total + page.data.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
    enabled: trimmed.length >= 2 || hasActiveFilters,
  });
}
