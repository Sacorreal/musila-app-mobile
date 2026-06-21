import { z } from 'zod';

export const loginSchema = z.object({
  citizenID: z
    .string()
    .min(1, 'El ID de ciudadano es requerido'),
    
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'Mínimo 8 caracteres'),
});

export const forgotPasswordSchema = z.object({
  citizenID: z
    .string()
    .min(1, 'El ID de ciudadano es requerido')
    
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
