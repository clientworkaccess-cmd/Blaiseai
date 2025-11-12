import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { uploadFileToWebhook } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { AudioUpload } from './AudioUpload';
import { TranscriptUpload } from './TranscriptUpload';

const GeneralUpload: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
    });

    const handleSubmit = async () => {
        if (!file || !category.trim()) {
            addToast('Please select a file and provide a category.', 'error');
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
                category: category.trim(),
                size_mb: file.size / 1024 / 1024,
                status: 'processed',
                upload_date: new Date().toISOString(),
                mime_type: file.type,
                video_url: videoUrl.trim() || null,
            });

            if (insertError) throw insertError;

            // Step 2: Send the file to the webhook for processing
            await uploadFileToWebhook(file, user.email!, videoUrl || undefined);
            
            addToast('File uploaded successfully!', 'success');
            setFile(null);
            setCategory('');
            setVideoUrl('');
        } catch (error: any) {
            addToast(`Upload failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <h3 className="text-lg font-medium text-gray-900">Upload Document</h3>
            <p className="mt-1 text-sm text-gray-500">
                Upload a document (e.g., PDF, DOCX, TXT) to be added to the knowledge base.
            </p>
            <div
                {...getRootProps()}
                className={`mt-4 border-2 border-dashed rounded-md px-6 pt-5 pb-6 flex justify-center ${
                isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
                }`}
            >
                <div className="space-y-1 text-center">
                     <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                        <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                        >
                        <span>Upload a file</span>
                        <input {...getInputProps()} id="file-upload" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOCX, TXT up to 50MB</p>
                </div>
            </div>

            {file && (
                <div className="mt-4 text-sm text-gray-700">
                <strong>Selected file:</strong> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
            )}

             <div className="mt-4">
                <Input
                    id="category"
                    label="Category"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Product Manuals"
                    required
                />
            </div>

            <div className="mt-4">
                <Input
                    id="video-url"
                    label="Associated Video URL (Optional)"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                />
            </div>
            
            <div className="mt-6 text-right">
                <Button onClick={handleSubmit} isLoading={loading} disabled={!file || !category.trim()}>
                    Upload File
                </Button>
            </div>
        </Card>
    );
};

export const Upload: React.FC = () => {
  const [activeTab, setActiveTab] = useState('document');
  const tabs = [
    { id: 'document', label: 'Document' },
    { id: 'audio', label: 'Audio' },
    { id: 'transcript', label: 'Transcript' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'audio':
        return <AudioUpload />;
      case 'transcript':
        return <TranscriptUpload />;
      case 'document':
      default:
        return <GeneralUpload />;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Upload Content</h1>
      <div className="mt-8">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Select a tab</label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            onChange={(e) => setActiveTab(e.target.value)}
            value={activeTab}
          >
            {tabs.map((tab) => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    tab.id === activeTab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
        <div className="mt-6">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};