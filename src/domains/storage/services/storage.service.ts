import { api } from '@/shared/libs/api';
import { apiURLs } from '@/shared/constants/urls';
import type { PresignedUrlResponse, StorageFolder } from '../types/storage.types';

export const storageService = {
  async requestPresignedUrl(folder: StorageFolder, fileType: string): Promise<PresignedUrlResponse> {
    const { data } = await api.post<PresignedUrlResponse>(apiURLs.storage.presignedUrls, {
      folder,
      fileType,
    });
    return data;
  },

  async uploadFile(uploadUrl: string, uri: string, mimeType: string): Promise<void> {
    const response = await fetch(uri);
    const blob = await response.blob();
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': mimeType },
      body: blob,
    });
  },
};
