
const WEBHOOK_URL = 'https://n8n.srv927950.hstgr.cloud/webhook/0ac9a895-a1f1-4431-a93c-e4095904fa9e';

export const uploadFileToWebhook = async (file: File, email: string): Promise<Response> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('email', email);

  try {
    const response = await fetch(WEBHOOK_URL, {
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
