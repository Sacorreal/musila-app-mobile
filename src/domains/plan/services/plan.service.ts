import { api } from '@/shared/libs/api';
import { apiURLs } from '@/shared/constants/urls';
import type { PlanStatus } from '../types/plan.types';

export const planService = {
  async getPlanStatus(): Promise<PlanStatus> {
    const { data } = await api.get<PlanStatus>(apiURLs.me.plan);
    return data;
  },
};
