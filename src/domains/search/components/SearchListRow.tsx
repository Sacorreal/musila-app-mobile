import { memo } from 'react';
import type { SearchAuthorDto, SearchGenreDto, SearchListItem, SearchResult } from '../types/search.types';
import { SearchAuthorItem } from './SearchAuthorItem';
import { SearchGenreItem } from './SearchGenreItem';
import { SearchResultItem } from './SearchResultItem';
import { SearchSectionHeader } from './SearchSectionHeader';
import { SearchSeeAllRow } from './SearchSeeAllRow';

interface SearchListRowProps {
  item: SearchListItem;
  query: string;
  onPressTrack: (track: SearchResult) => void;
  onPressAuthor: (author: SearchAuthorDto) => void;
  onPressGenre: (genre: SearchGenreDto) => void;
  onSeeAll: (section: SearchListItem['section']) => void;
}

function SearchListRowBase({
  item,
  query,
  onPressTrack,
  onPressAuthor,
  onPressGenre,
  onSeeAll,
}: SearchListRowProps) {
  switch (item.kind) {
    case 'header':
      return <SearchSectionHeader label={item.label} />;
    case 'track':
      return <SearchResultItem result={item.data} query={query} onPress={onPressTrack} />;
    case 'author':
      return <SearchAuthorItem author={item.data} query={query} onPress={onPressAuthor} />;
    case 'genre':
      return <SearchGenreItem genre={item.data} query={query} onPress={onPressGenre} />;
    case 'see-all':
      return (
        <SearchSeeAllRow label={item.label} total={item.total} onPress={() => onSeeAll(item.section)} />
      );
    default:
      return null;
  }
}

export const SearchListRow = memo(SearchListRowBase);
