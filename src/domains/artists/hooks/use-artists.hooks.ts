import { useQuery } from '@tanstack/react-query';
import { artistsService } from '../services/artists.service';

export function useFeaturedArtists() {
  return useQuery({
    queryKey: ['artists', 'featured'],
    queryFn: () => artistsService.getFeaturedArtists(10),
  });
}

export function useArtistById(id: string) {
  return useQuery({
    queryKey: ['artists', id],
    queryFn: () => artistsService.getArtistById(id),
    enabled: !!id,
  });
}
