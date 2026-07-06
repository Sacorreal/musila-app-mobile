import { api } from '@/shared/libs/api';
import { apiURLs } from '@/shared/constants/urls';
import type { SearchResponse } from '../types/search.types';

export const searchService = {
  async search(query: string, limit = 20): Promise<SearchResponse> {
    const { data } = await api.get<SearchResponse>(apiURLs.search.base, {
      params: { q: query, limit },
    });
    return data;
  },
};
