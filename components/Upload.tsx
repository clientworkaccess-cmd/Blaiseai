
import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { uploadFileToWebhook } from '../services/api';
import { useToast } from '../hooks/useToast';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { FileStatus } from '../types';

export const Upload: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !category || !user) {
      addToast('Please select a file and enter a category.', 'error');
      return;
    }
    setLoading(true);

    try {
      // 1. Send file to webhook
      await uploadFileToWebhook(file, user.email!);

      // 2. Insert metadata into Supabase
      const { error } = await supabase.from('files').insert({
        user_id: user.id,
        name: file.name,
        category: category,
        size_mb: file.size / (1024 * 1024),
        upload_date: new Date().toISOString(),
        status: FileStatus.Processing,
      });

      if (error) throw error;

      addToast('File upload initiated! It is now processing.', 'success');
      setFile(null);
      setCategory('');
    } catch (error: any) {
      addToast(`Upload failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Upload New File</h1>
      <div className="mt-8 max-w-2xl">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">File</label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragging ? 'border-indigo-500' : 'border-gray-300'} border-dashed rounded-md transition-colors`}
              >
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  {file ? (
                    <p className="text-sm text-gray-900 font-medium">{file.name}</p>
                  ) : (
                    <p className="text-xs text-gray-500">PDF, TXT, DOCX up to 10MB</p>
                  )}
                </div>
              </div>
            </div>

            <Input
              id="category"
              label="Category"
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Student Onboarding"
            />
            
            <div className="text-right">
              <Button type="submit" isLoading={loading} disabled={!file || !category}>
                Upload File
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
