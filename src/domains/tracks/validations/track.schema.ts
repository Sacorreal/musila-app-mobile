import { z } from 'zod';

export const createTrackSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  genreId: z.string().min(1, 'El género es requerido'),
  subGenre: z.string().optional(),
  language: z.string().min(1, 'El idioma es requerido'),
  lyric: z.string().min(1, 'La letra es requerida'),
  audioUri: z.string().min(1, 'El audio es requerido'),
  coverUri: z.string().optional(),
  isAvailable: z.boolean().default(true),
  isGospel: z.boolean().default(false),
  iswc: z.string().optional(),
});

export type CreateTrackSchema = z.infer<typeof createTrackSchema>;
