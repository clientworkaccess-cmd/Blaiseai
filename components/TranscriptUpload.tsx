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
        if (!transcript.trim() || !fileName.trim()) return addToast('Missing content or filename.', 'error');
        if (!user) return addToast('Auth required.', 'error');

        setLoading(true);
        try {
            let fileContent = transcript;
            if (videoUrl.trim()) fileContent = `Video URL: ${videoUrl.trim()}\n\n${transcript}`;

            const file = new File([new Blob([fileContent], { type: 'text/plain' })], `${fileName.trim()}.txt`, { type: 'text/plain' });

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
            
            addToast('Transcript saved.', 'success');
            setTranscript('');
            setFileName('');
            setVideoUrl('');
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Upload Transcript" description="Paste text directly into the knowledge base.">
            <div className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input id="fileName" label="File Name" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Meeting Notes" />
                    <Input id="category" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase">Content</label>
                    <textarea
                        className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[300px] font-mono leading-relaxed"
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="Paste text content here..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Input id="videoUrl" label="Video URL (Optional)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://" />
                     <div className="hidden md:block"></div>
                </div>
            </div>
            
            <div className="mt-8 flex justify-end">
                <Button onClick={handleSubmit} isLoading={loading} disabled={!transcript.trim()}>Save Transcript</Button>
            </div>
        </Card>
    );
};