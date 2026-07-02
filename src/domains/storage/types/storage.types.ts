export enum StorageFolder {
  TRACKS = 'tracks/audio',
  COVERS = 'tracks/covers',
  AVATARS = 'users/avatars',
  DOCUMENTS = 'documents',
  INTELLECTUAL_PROPERTY = 'intellectual-property',
}

export interface PresignedUrlRequest {
  folder: StorageFolder;
  fileType: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export interface UploadableFile {
  uri: string;
  mimeType: string;
  folder: StorageFolder;
}

export interface UploadedFile {
  key: string;
  publicUrl: string;
}
