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
        if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

    const handleSubmit = async () => {
        if (!file || !category.trim()) return addToast('Missing file or category.', 'error');
        if (!user) return addToast('Authentication required.', 'error');
        
        setLoading(true);
        try {
            const { error } = await supabase.from('files').insert({
                user_id: user.id,
                name: file.name,
                category: category.trim(),
                size_mb: file.size / 1024 / 1024,
                status: 'processed',
                upload_date: new Date().toISOString(),
                mime_type: file.type,
                video_url: videoUrl.trim() || null,
            });

            if (error) throw error;
            await uploadFileToWebhook(file, user.email!, videoUrl || undefined);
            
            addToast('Upload complete.', 'success');
            setFile(null);
            setCategory('');
            setVideoUrl('');
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Upload Document" description="Supported formats: PDF, DOCX, TXT. Maximum size: 50MB.">
            <div
                {...getRootProps()}
                className={`mt-4 border border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${
                isDragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-zinc-700 hover:border-zinc-500 hover:bg-white/5'
                }`}
            >
                <input {...getInputProps()} />
                <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
                     <svg className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                </div>
                <p className="text-sm font-medium text-white">Click or drag file to upload</p>
                <p className="text-xs text-zinc-500 mt-1">Single file upload</p>
            </div>

            {file && (
                <div className="mt-4 flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-indigo-500/20 text-indigo-400 rounded flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <span className="text-sm text-white font-medium">{file.name}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-zinc-500 hover:text-white"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input id="category" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Sales, Technical" />
                <Input id="videoUrl" label="Video URL (Optional)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://" />
            </div>
            
            <div className="mt-8 flex justify-end">
                <Button onClick={handleSubmit} isLoading={loading} disabled={!file || !category.trim()}>Upload File</Button>
            </div>
        </Card>
    );
};

export const Upload: React.FC = () => {
  const [activeTab, setActiveTab] = useState('document');
  
  return (
    <div className="w-full space-y-6">
      <div className="flex space-x-1 bg-zinc-900/50 p-1 rounded-xl border border-white/10 w-fit">
        {['document', 'audio', 'transcript'].map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                    activeTab === tab ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
            >
                {tab}
            </button>
        ))}
      </div>
      
      {activeTab === 'document' && <GeneralUpload />}
      {activeTab === 'audio' && <AudioUpload />}
      {activeTab === 'transcript' && <TranscriptUpload />}
    </div>
  );
};