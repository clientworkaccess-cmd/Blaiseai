import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://goarkmiycrquppykkzoo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYXJrbWl5Y3JxdXBweWtrem9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3Nzc2OTUsImV4cCI6MjA3ODM1MzY5NX0.vNC92DDq8QR0ZcZ4sQwFY_9uy16zwoCWEt2QAoutlxc';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is not set. Please update services/supabaseClient.ts');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);