import { create } from 'zustand';
import type { PlanResource } from '../types/plan-limit.types';

export interface PlanLimitInfo {
  resource: PlanResource;
  limit: number;
  current: number;
}

interface PlanLimitState {
  activeLimit: PlanLimitInfo | null;
  showLimit: (info: PlanLimitInfo) => void;
  dismiss: () => void;
}

export const usePlanLimitStore = create<PlanLimitState>((set) => ({
  activeLimit: null,
  showLimit: (info) => set({ activeLimit: info }),
  dismiss: () => set({ activeLimit: null }),
}));
