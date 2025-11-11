import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { uploadFileToWebhook } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

export const TranscriptUpload: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [transcript, setTranscript] = useState('');
    const [fileName, setFileName] = useState('');
    const [category, setCategory] = useState('Transcript');
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!transcript.trim() || !fileName.trim() || !category.trim()) {
            addToast('Please provide a file name, category, and transcript content.', 'error');
            return;
        }
        if (!user) {
            addToast('You must be logged in to upload.', 'error');
            return;
        }
        setLoading(true);
        try {
            const blob = new Blob([transcript], { type: 'text/plain' });
            const file = new File([blob], `${fileName.trim()}.txt`, { type: 'text/plain' });

            // Step 1: Insert metadata into Supabase first
            const { error: insertError } = await supabase.from('files').insert({
                user_id: user.id,
                name: file.name,
                category: category.trim(),
                size_mb: file.size / 1024 / 1024,
                status: 'processing',
                upload_date: new Date().toISOString(),
                mime_type: file.type,
                video_url: videoUrl.trim() || null,
            });

            if (insertError) throw insertError;

            // Step 2: Send the file to the webhook for processing
            await uploadFileToWebhook(file, user.email!, videoUrl || undefined);
            
            addToast('Transcript upload initiated! Status will update shortly.', 'success');
            setTranscript('');
            setFileName('');
            setVideoUrl('');
            setCategory('Transcript');

        } catch (error: any) {
            addToast(`Upload failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <h3 className="text-lg font-medium text-gray-900">Upload Transcript</h3>
            <p className="mt-1 text-sm text-gray-500">
                Paste a transcript below. It will be saved as a .txt file and added to the knowledge base.
            </p>

            <div className="mt-4">
                <Input
                    id="file-name"
                    label="File Name (without extension)"
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="e.g., Meeting Notes 2024-01-01"
                    required
                />
            </div>

            <div className="mt-4">
                <Input
                    id="category-transcript"
                    label="Category"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Meeting Transcripts"
                    required
                />
            </div>

            <div className="mt-4">
                <label htmlFor="transcript-content" className="block text-sm font-medium text-gray-700">
                    Transcript Content
                </label>
                <div className="mt-1">
                    <textarea
                        id="transcript-content"
                        rows={10}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="Paste your transcript here..."
                        required
                    />
                </div>
            </div>

            <div className="mt-4">
                <Input
                    id="video-url-transcript"
                    label="Associated Video URL (Optional)"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                />
            </div>
            
            <div className="mt-6 text-right">
                <Button onClick={handleSubmit} isLoading={loading} disabled={!transcript.trim() || !fileName.trim() || !category.trim()}>
                    Upload Transcript
                </Button>
            </div>
        </Card>
    );
};
