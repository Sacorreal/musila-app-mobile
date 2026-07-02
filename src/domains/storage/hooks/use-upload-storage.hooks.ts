import { useState } from 'react';
import { storageService } from '../services/storage.service';
import type { StorageFolder, UploadableFile, UploadedFile } from '../types/storage.types';

interface UploadProgress {
  [field: string]: number;
}

export function useUploadStorage() {
  const [progresses, setProgresses] = useState<UploadProgress>({});
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = async (
    files: Array<UploadableFile & { field: string }>
  ): Promise<Array<UploadedFile & { field: string }>> => {
    setIsUploading(true);
    const results: Array<UploadedFile & { field: string }> = [];

    try {
      for (const file of files) {
        setProgresses((prev) => ({ ...prev, [file.field]: 0 }));
        const { uploadUrl, key, publicUrl } = await storageService.requestPresignedUrl(
          file.folder,
          file.mimeType
        );
        await storageService.uploadFile(uploadUrl, file.uri, file.mimeType);
        setProgresses((prev) => ({ ...prev, [file.field]: 100 }));
        results.push({ field: file.field, key, publicUrl });
      }
    } finally {
      setIsUploading(false);
    }

    return results;
  };

  const rollback = (keys: string[]): Promise<void> => storageService.deleteBatch(keys);

  return { uploadFiles, rollback, progresses, isUploading };
}
