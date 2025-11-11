
import React, { useState } from 'react';
import { useToast } from '../hooks/useToast';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export const Refresh: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleRefresh = () => {
    setLoading(true);
    addToast('Knowledge base refresh initiated...', 'info');
    // Mocking an async operation like a Supabase Edge Function call
    setTimeout(() => {
      setLoading(false);
      addToast('Knowledge base successfully refreshed!', 'success');
    }, 2500);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Refresh Knowledge Base</h1>
      <div className="mt-8 max-w-2xl">
        <Card>
          <div className="text-center">
             <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-11.667 0a8.25 8.25 0 0111.667 0l3.181 3.183M2.985 19.644l3.181-3.183m0 0a8.25 8.25 0 0111.667 0l3.181 3.183" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Refresh AI Knowledge Base</h3>
            <p className="mt-1 text-sm text-gray-500">
              Click the button below to trigger a full refresh of the AI's knowledge base. This will process all new and updated files.
            </p>
            <div className="mt-6">
              <Button onClick={handleRefresh} isLoading={loading} size="large">
                Refresh Knowledge Base
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
