const GENERAL_WEBHOOK_URL = 'https://n8n.srv927950.hstgr.cloud/webhook/0ac9a895-a1f1-4431-a93c-e4095904fa9e';
const AUDIO_WEBHOOK_URL = 'https://n8n.srv927950.hstgr.cloud/webhook/audio-transcript';
const GITHUB_WEBHOOK_URL = 'https://n8n.srv927950.hstgr.cloud/webhook/webhook-github';

const GITHUB_CLIENT_ID = 'Ov23li01i7Gi0jKZVgNh';
const GITHUB_CLIENT_SECRET = 'dda77885c579a94201d4d001d990f20151cf2078';

const uploadToWebhook = async (url: string, file: File, email: string, videoUrl?: string): Promise<Response> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('email', email);
  if (videoUrl) {
    formData.append('video_url', videoUrl);
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Error uploading file to webhook:', error);
    throw error;
  }
};

export const uploadFileToWebhook = (file: File, email: string, videoUrl?: string): Promise<Response> => {
    return uploadToWebhook(GENERAL_WEBHOOK_URL, file, email, videoUrl);
};

export const uploadAudioToWebhook = (file: File, email: string): Promise<Response> => {
    return uploadToWebhook(AUDIO_WEBHOOK_URL, file, email);
};

export const sendGitHubCodeToWebhook = async (code: string, email: string): Promise<Response> => {
    const payload = {
        code,
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        email,
        grant_type: 'authorization_code'
    };

    try {
        const response = await fetch(GITHUB_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
             throw new Error(`Webhook failed with status: ${response.status}`);
        }
        return response;
    } catch (error) {
        console.error('Error sending GitHub code to webhook:', error);
        throw error;
    }
};