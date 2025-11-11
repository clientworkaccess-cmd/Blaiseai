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
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.flac', '.ogg']
    },
    multiple: false,
  });

  const handleSubmit = async () => {
    if (!file) {
      addToast('Please select an audio file to upload.', 'error');
      return;
    }
    if (!user) {
        addToast('You must be logged in to upload.', 'error');
        return;
    }
    setLoading(true);

    try {
       // Step 1: Insert metadata into Supabase first
       const { error: insertError } = await supabase.from('files').insert({
          user_id: user.id, // FIX: Added user_id to satisfy RLS policy
          name: file.name,
          category: 'Audio',
          size_mb: file.size / 1024 / 1024,
          status: 'processing',
          upload_date: new Date().toISOString(),
          mime_type: file.type,
      });

      if (insertError) throw insertError;

      // Step 2: Send the file to the dedicated audio webhook
      await uploadAudioToWebhook(file, user.email!);

      addToast('Audio upload initiated! Status will update shortly.', 'success');
      setFile(null);
    } catch (error: any) {
      addToast(`Upload failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
        <h3 className="text-lg font-medium text-gray-900">Upload Audio File</h3>
        <p className="mt-1 text-sm text-gray-500">
            Upload an audio file (.mp3, .wav, etc.) to be transcribed and added to the knowledge base.
        </p>
        <div
            {...getRootProps()}
            className={`mt-4 border-2 border-dashed rounded-md px-6 pt-5 pb-6 flex justify-center ${
            isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
            }`}
        >
            <div className="space-y-1 text-center">
             <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5a6 6 0 00-6-6v1.5a4.5 4.5 0 014.5 4.5v1.5a4.5 4.5 0 01-4.5 4.5v-1.5zm-6-6v-1.5a6 6 0 016-6v1.5a4.5 4.5 0 00-4.5 4.5v1.5a4.5 4.5 0 004.5 4.5v-1.5a6 6 0 01-6-6z" />
            </svg>
            <div className="flex text-sm text-gray-600">
                <label
                htmlFor="audio-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                >
                <span>Upload a file</span>
                <input {...getInputProps()} id="audio-upload" />
                </label>
                <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">Audio files up to 50MB</p>
            </div>
        </div>
        {file && (
            <div className="mt-4 text-sm text-gray-700">
            <strong>Selected file:</strong> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
        )}
        <div className="mt-6 text-right">
            <Button onClick={handleSubmit} isLoading={loading} disabled={!file}>
            Upload Audio
            </Button>
        </div>
    </Card>
  );
};