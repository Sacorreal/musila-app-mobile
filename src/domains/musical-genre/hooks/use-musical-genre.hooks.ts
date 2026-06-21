import { useQuery } from '@tanstack/react-query';
import { musicalGenreService } from '../services/musical-genre.service';

export function useGenres() {
  return useQuery({
    queryKey: ['musical-genres'],
    queryFn: () => musicalGenreService.getGenres(),
  });
}

export function useGenreById(id: string) {
  return useQuery({
    queryKey: ['musical-genres', id],
    queryFn: () => musicalGenreService.getGenreById(id),
    enabled: !!id,
  });
}
