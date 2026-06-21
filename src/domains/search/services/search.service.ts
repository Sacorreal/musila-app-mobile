import { api } from '@/shared/libs/api';
import { apiURLs } from '@/shared/constants/urls';
import type { SearchResponse, SearchResult } from '../types/search.types';

export const searchService = {
  async search(query: string): Promise<SearchResult[]> {
    const { data } = await api.get<SearchResponse>(apiURLs.search.base, {
      params: { q: query },
    });
    return Array.isArray(data.data) ? data.data : (Array.isArray(data as any) ? (data as any) : []);
  },
};
