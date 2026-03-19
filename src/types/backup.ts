export interface Backup {
  id: string;
  fileName: string;
  filePath: string;
  createdAt: string;
  profileName: string | null;
  sizeBytes: number;
}
