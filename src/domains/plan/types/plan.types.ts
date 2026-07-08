import type { PlanResource } from '@/shared/types/plan-limit.types';

export interface ResourceUsage {
  current: number;
  /** null = ilimitado */
  limit: number | null;
}

export interface PlanStatus {
  plan: 'free' | 'pro';
  role: string;
  startDate: string | null;
  expiresAt: string | null;
  billingPeriod: 'monthly' | 'annual' | null;
  isLifetime: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
  features: string[];
  usage: Partial<Record<PlanResource, ResourceUsage>>;
}

export type { PlanResource };
