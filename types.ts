import { Session, User } from '@supabase/supabase-js';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  github_connected: boolean;
  slack_connected: boolean;
  avatar_url?: string;
  updated_at?: string;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

export enum FileStatus {
  Processing = 'processing',
  Processed = 'processed',
  Failed = 'failed',
}

export interface FileRecord {
  id: string;
  user_id: string;
  created_at: string;
  name: string;
  category: string;
  size_mb: number;
  status: FileStatus;
  video_url?: string;
  upload_date: string;
  mime_type?: string;
}