import { Session, User } from '@supabase/supabase-js';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

export enum FileStatus {
  Processing = 'processing',
  Processed = 'processed',
  Failed = 'failed',
}

export interface FileRecord {
  id: string;
  created_at: string;
  name: string;
  category: string;
  size_mb: number;
  status: FileStatus;
  video_url?: string;
  upload_date: string;
  mime_type?: string;
}