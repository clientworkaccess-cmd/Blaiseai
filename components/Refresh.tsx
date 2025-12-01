import React, { useState } from 'react';
import { useToast } from '../hooks/useToast';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export const Refresh: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleRefresh = () => {
    setLoading(true);
    addToast('Sync started...', 'info');
    setTimeout(() => {
      setLoading(false);
      addToast('Sync complete.', 'success');
    }, 2500);
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <Card className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-6">
            <svg className="h-8 w-8 text-white animate-spin-slow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-11.667 0a8.25 8.25 0 0111.667 0l3.181 3.183M2.985 19.644l3.181-3.183m0 0a8.25 8.25 0 0111.667 0l3.181 3.183" />
            </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Sync Knowledge Base</h3>
        <p className="text-zinc-400 mb-8 text-sm px-4">
            Manually trigger a re-index to ensure the AI has the latest document changes.
        </p>
        <Button onClick={handleRefresh} isLoading={loading} className="w-full">
            Start Sync
        </Button>
      </Card>
    </div>
  );
};