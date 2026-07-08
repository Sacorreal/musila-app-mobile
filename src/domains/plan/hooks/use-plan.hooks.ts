import { useQuery } from '@tanstack/react-query';
import { planService } from '../services/plan.service';

export function usePlanStatus() {
  return useQuery({
    queryKey: ['plan', 'me'],
    queryFn: () => planService.getPlanStatus(),
    staleTime: 1000 * 60 * 2,
  });
}
