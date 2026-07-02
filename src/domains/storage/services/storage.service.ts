import { File, UploadType } from 'expo-file-system';
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
    const file = new File(uri);
    const result = await file.upload(uploadUrl, {
      httpMethod: 'PUT',
      uploadType: UploadType.BINARY_CONTENT,
      headers: {
        'Content-Type': mimeType,
        'x-amz-acl': 'public-read',
      },
    });
    if (result.status < 200 || result.status >= 300) {
      throw new Error(`Error al subir archivo a Spaces (${result.status}): ${result.body}`);
    }
  },

  async deleteBatch(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await api.post(apiURLs.storage.deleteBatch, { keys });
  },
};
