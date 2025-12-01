import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { uploadAudioToWebhook } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export const AudioUpload: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.flac', '.ogg'] },
    multiple: false,
  });

  const handleSubmit = async () => {
    if (!file || !user) return;
    setLoading(true);
    try {
       const { error } = await supabase.from('files').insert({
          user_id: user.id,
          name: file.name,
          category: 'Audio',
          size_mb: file.size / 1024 / 1024,
          status: 'processed',
          upload_date: new Date().toISOString(),
          mime_type: file.type,
      });

      if (error) throw error;
      await uploadAudioToWebhook(file, user.email!);

      addToast('Audio uploaded.', 'success');
      setFile(null);
    } catch (error: any) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Upload Audio" description="MP3, WAV, M4A. We will transcribe and index it.">
        <div
            {...getRootProps()}
            className={`mt-4 border border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${
            isDragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-zinc-700 hover:border-zinc-500 hover:bg-white/5'
            }`}
        >
            <input {...getInputProps()} />
            <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
                 <svg className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 006-6v-1.5a6 6 0 00-6-6v1.5a4.5 4.5 0 014.5 4.5v1.5a4.5 4.5 0 01-4.5 4.5v-1.5zm-6-6v-1.5a6 6 0 016-6v1.5a4.5 4.5 0 00-4.5 4.5v1.5a4.5 4.5 0 004.5 4.5v-1.5a6 6 0 01-6-6z" /></svg>
            </div>
            <p className="text-sm font-medium text-white">Drop audio file here</p>
        </div>
        
        {file && (
             <div className="mt-4 flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="text-sm text-white font-medium">{file.name}</span>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-zinc-500 hover:text-white">&times;</button>
            </div>
        )}

        <div className="mt-6 flex justify-end">
            <Button onClick={handleSubmit} isLoading={loading} disabled={!file}>Upload Audio</Button>
        </div>
    </Card>
  );
};