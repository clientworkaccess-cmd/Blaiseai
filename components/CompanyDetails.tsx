import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { uploadFileToWebhook } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

interface CompanyDetailsState {
  companyName: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  overview: string;
}

export const CompanyDetails: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<CompanyDetailsState>({
    companyName: '',
    address: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    overview: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setDetails(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (!details.companyName.trim() || !details.contactEmail.trim()) {
      addToast('Please fill in at least Company Name and Contact Email.', 'error');
      return;
    }
    if (!user) {
      addToast('You must be logged in to upload.', 'error');
      return;
    }
    setLoading(true);

    try {
      const formattedContent = `
Company Profile: ${details.companyName}
================================

## Contact Information
- Contact Person: ${details.contactPerson}
- Email: ${details.contactEmail}
- Phone: ${details.contactPhone}
- Website: ${details.website}

## Address
${details.address}

## Company Overview
${details.overview}
      `.trim();

      const fileName = `${details.companyName.trim().replace(/\s+/g, '_')}_details.txt`;
      const file = new File([new Blob([formattedContent], { type: 'text/plain' })], fileName, { type: 'text/plain' });

      // Step 1: Insert metadata into Supabase
      const { error: insertError } = await supabase.from('files').insert({
        user_id: user.id,
        name: file.name,
        category: 'Company Profile',
        size_mb: file.size / 1024 / 1024,
        status: 'processed',
        upload_date: new Date().toISOString(),
        mime_type: file.type,
      });

      if (insertError) throw insertError;

      // Step 2: Send the file to the webhook
      await uploadFileToWebhook(file, user.email!);
      
      addToast('Company details PDF generated and uploaded successfully!', 'success');
      setDetails({
        companyName: '',
        address: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        website: '',
        overview: '',
      });
    } catch (error: any) {
      addToast(`Upload failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Company Profile</h1>
      <p className="mt-2 text-sm text-gray-600">
        Fill in the details below. This information will be compiled into a single document and added to the knowledge base.
      </p>

      <div className="mt-8 max-w-3xl">
        <Card>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                id="companyName"
                label="Company Name"
                type="text"
                value={details.companyName}
                onChange={handleChange}
                placeholder="e.g., Acme Corporation"
                required
              />
            </div>
            
            <Input
              id="contactPerson"
              label="Contact Person"
              type="text"
              value={details.contactPerson}
              onChange={handleChange}
              placeholder="e.g., John Doe"
            />

            <Input
              id="contactEmail"
              label="Contact Email"
              type="email"
              value={details.contactEmail}
              onChange={handleChange}
              placeholder="e.g., contact@acme.com"
              required
            />
            
            <Input
              id="contactPhone"
              label="Contact Phone"
              type="tel"
              value={details.contactPhone}
              onChange={handleChange}
              placeholder="e.g., +1 (555) 123-4567"
            />
            
            <Input
              id="website"
              label="Website"
              type="url"
              value={details.website}
              onChange={handleChange}
              placeholder="e.g., https://www.acme.com"
            />
            
            <div className="sm:col-span-2">
               <Input
                id="address"
                label="Address"
                type="text"
                value={details.address}
                onChange={handleChange}
                placeholder="e.g., 123 Acme St, Anytown, USA 12345"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="overview" className="block text-sm font-medium text-gray-700">
                Company Overview
              </label>
              <div className="mt-1">
                <textarea
                  id="overview"
                  name="overview"
                  rows={6}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={details.overview}
                  onChange={handleChange}
                  placeholder="A brief description of the company..."
                />
              </div>
            </div>
          </div>
          <div className="mt-6 text-right">
            <Button onClick={handleSubmit} isLoading={loading} disabled={!details.companyName.trim()}>
              Generate & Upload Profile
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
