import { useQuery } from '@tanstack/react-query';
import { searchService } from '../services/search.service';

export function useSearch(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['search', trimmed],
    queryFn: () => searchService.search(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: 60_000,
    retry: 1,
  });
}
