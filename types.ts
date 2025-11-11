
import { User, Session } from '@supabase/supabase-js';

export enum FileStatus {
  Processing = 'processing',
  Processed = 'processed',
  Failed = 'failed',
}

export interface FileRecord {
  id: number;
  created_at: string;
  user_id: string;
  name: string;
  category: string;
  size_mb: number;
  upload_date: string;
  status: FileStatus;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}
