import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { uploadFileToWebhook } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

export const CompanyDetails: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({
    companyName: '', address: '', contactPerson: '', contactEmail: '', contactPhone: '', website: '', overview: ''
  });

  const handleChange = (e: any) => setDetails(prev => ({ ...prev, [e.target.id]: e.target.value }));

  const handleSubmit = async () => {
    if (!details.companyName || !details.contactEmail) return addToast('Required fields missing.', 'error');
    setLoading(true);

    try {
      const content = `Company: ${details.companyName}\nEmail: ${details.contactEmail}\nPhone: ${details.contactPhone}\nSite: ${details.website}\nAddress: ${details.address}\n\nOverview:\n${details.overview}`;
      const file = new File([new Blob([content], { type: 'text/plain' })], `${details.companyName.replace(/\s+/g, '_')}_profile.txt`, { type: 'text/plain' });

      const { error } = await supabase.from('files').insert({
        user_id: user!.id, name: file.name, category: 'Company Profile', size_mb: file.size / 1024 / 1024, status: 'processed', upload_date: new Date().toISOString(), mime_type: file.type
      });
      if (error) throw error;
      await uploadFileToWebhook(file, user!.email!);
      addToast('Profile saved.', 'success');
      setDetails({ companyName: '', address: '', contactPerson: '', contactEmail: '', contactPhone: '', website: '', overview: '' });
    } catch (error: any) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card title="Company Profile" description="Centralized context for the AI model.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="md:col-span-2">
              <Input id="companyName" label="Company Name" value={details.companyName} onChange={handleChange} required />
            </div>
            <Input id="contactPerson" label="Contact Person" value={details.contactPerson} onChange={handleChange} />
            <Input id="contactEmail" label="Contact Email" type="email" value={details.contactEmail} onChange={handleChange} required />
            <Input id="contactPhone" label="Phone" type="tel" value={details.contactPhone} onChange={handleChange} />
            <Input id="website" label="Website" type="url" value={details.website} onChange={handleChange} />
            <div className="md:col-span-2">
               <Input id="address" label="Address" value={details.address} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
               <label className="text-xs font-semibold text-zinc-400 uppercase mb-2 block">Company Overview</label>
               <textarea id="overview" rows={5} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={details.overview} onChange={handleChange} />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <Button onClick={handleSubmit} isLoading={loading}>Save Profile</Button>
          </div>
      </Card>
    </div>
  );
};