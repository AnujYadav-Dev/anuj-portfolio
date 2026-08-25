export interface StorageResult {
  url: string;
  storedName: string;
}

export interface StorageAdapter {
  save(buffer: Buffer, filename: string, mimeType: string): Promise<StorageResult>;
  delete?(filenameOrUrl: string): Promise<void>;
}
