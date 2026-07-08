import { isAxiosError, type AxiosError } from 'axios';
import type { PlanLimitErrorPayload } from '../types/plan-limit.types';

export function isPlanLimitError(error: unknown): error is AxiosError<PlanLimitErrorPayload> {
  return (
    isAxiosError(error) &&
    error.response?.status === 402 &&
    (error.response?.data as PlanLimitErrorPayload | undefined)?.error === 'PLAN_LIMIT_REACHED'
  );
}
