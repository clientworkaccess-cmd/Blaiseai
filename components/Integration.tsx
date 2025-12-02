
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { sendGitHubCodeToWebhook, sendSlackCodeToWebhook } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

const GITHUB_CLIENT_ID = 'Ov23li01i7Gi0jKZVgNh';
const SLACK_CLIENT_ID = '1557536440852.10032312742838';

export const Integration: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [loadingGithub, setLoadingGithub] = useState(false);
    const [loadingSlack, setLoadingSlack] = useState(false);
    
    // Check metadata for connections
    const isGithubConnected = user?.user_metadata?.github_connected === true;
    const isSlackConnected = user?.user_metadata?.slack_connected === true;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');

        if (code && user?.email) {
            // Clean URL immediately
            window.history.replaceState({}, document.title, window.location.pathname);

            if (state === 'slack') {
                handleSlackCode(code);
            } else {
                // Default to GitHub if state is github or missing (backward compatibility)
                handleGithubCode(code);
            }
        }
    }, [user]);

    const handleGithubCode = async (code: string) => {
        setLoadingGithub(true);
        try {
            const name = user?.user_metadata?.full_name || 'Unknown User';
            await sendGitHubCodeToWebhook(code, user!.email!, name);
            
            const { error } = await supabase.auth.updateUser({
                data: { github_connected: true }
            });

            if (error) throw error;
            addToast('GitHub connected successfully.', 'success');
        } catch (error: any) {
            addToast('Failed to connect GitHub.', 'error');
            console.error(error);
        } finally {
            setLoadingGithub(false);
        }
    };

    const handleSlackCode = async (code: string) => {
        setLoadingSlack(true);
        try {
            const name = user?.user_metadata?.full_name || 'Unknown User';
            await sendSlackCodeToWebhook(code, user!.email!, name);
            
            const { error } = await supabase.auth.updateUser({
                data: { slack_connected: true }
            });

            if (error) throw error;
            addToast('Slack connected successfully.', 'success');
        } catch (error: any) {
            addToast('Failed to connect Slack.', 'error');
            console.error(error);
        } finally {
            setLoadingSlack(false);
        }
    };

    const handleConnectGithub = () => {
        const redirectUri = window.location.origin;
        // Added state=github
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo,user&redirect_uri=${redirectUri}&state=github`;
    };

    const handleDisconnectGithub = async () => {
        setLoadingGithub(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { github_connected: false }
            });
            if (error) throw error;
            addToast('GitHub disconnected.', 'info');
        } catch (error: any) {
            addToast('Error disconnecting GitHub.', 'error');
        } finally {
            setLoadingGithub(false);
        }
    };

    const handleConnectSlack = () => {
        const redirectUri = window.location.origin;
        const scopes = 'channels:read,chat:write,files:read'; // Customize these based on your needs
        // Added state=slack
        window.location.href = `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&scope=${scopes}&redirect_uri=${redirectUri}&state=slack`;
    };

    const handleDisconnectSlack = async () => {
        setLoadingSlack(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { slack_connected: false }
            });
            if (error) throw error;
            addToast('Slack disconnected.', 'info');
        } catch (error: any) {
            addToast('Error disconnecting Slack.', 'error');
        } finally {
            setLoadingSlack(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card title="Integrations" description="Connect third-party tools to your knowledge base.">
                
                {/* GitHub Integration */}
                <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-xl mt-6 transition-all hover:bg-white/10">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-lg shadow-white/10">
                            <svg className="h-7 w-7 text-black" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-lg">GitHub</h4>
                            <p className="text-sm text-zinc-400">
                                {isGithubConnected 
                                    ? 'Your repository is currently synced.' 
                                    : 'Sync repositories and pull requests.'}
                            </p>
                        </div>
                    </div>
                    {isGithubConnected ? (
                        <Button onClick={handleDisconnectGithub} isLoading={loadingGithub} variant="danger">
                            Disconnect
                        </Button>
                    ) : (
                        <Button onClick={handleConnectGithub} isLoading={loadingGithub}>
                            Connect GitHub
                        </Button>
                    )}
                </div>

                {/* Slack Integration */}
                <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-xl mt-6 transition-all hover:bg-white/10">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-[#4A154B] rounded-full flex items-center justify-center shadow-lg shadow-[#4A154B]/20">
                            {/* Slack Logo SVG */}
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.042 15.165a2.528 2.528 0 1 1-2.52-2.523h2.52v2.523Zm.84-2.523a2.528 2.528 0 1 1 2.522-2.522v2.522H5.882Zm2.955-5.896a2.528 2.528 0 1 1-2.523-2.52h2.523v2.52Zm2.523 .84a2.528 2.528 0 1 1 2.522 2.522h-2.522V7.586Zm5.896 2.955a2.528 2.528 0 1 1 2.52 2.523h-2.52V10.54Zm-.84 2.523a2.528 2.528 0 1 1-2.522 2.522v-2.522h2.522Zm-2.955 5.896a2.528 2.528 0 1 1 2.523 2.52h-2.523v-2.52Zm-2.523-.84a2.528 2.528 0 1 1-2.522-2.522h2.522v2.522Z" fill="white"/>
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-lg">Slack</h4>
                            <p className="text-sm text-zinc-400">
                                {isSlackConnected 
                                    ? 'Your workspace is currently synced.' 
                                    : 'Connect channels and workspace data.'}
                            </p>
                        </div>
                    </div>
                    {isSlackConnected ? (
                        <Button onClick={handleDisconnectSlack} isLoading={loadingSlack} variant="danger">
                            Disconnect
                        </Button>
                    ) : (
                        <Button onClick={handleConnectSlack} isLoading={loadingSlack}>
                            Connect Slack
                        </Button>
                    )}
                </div>

            </Card>
        </div>
    );
};
