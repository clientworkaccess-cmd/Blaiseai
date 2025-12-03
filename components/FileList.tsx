import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useToast } from '../hooks/useToast';
import { FileRecord, FileStatus } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

const PAGE_SIZE = 10;

const StatusBadge: React.FC<{ status: FileStatus }> = ({ status }) => {
  const styles = {
    [FileStatus.Processing]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    [FileStatus.Processed]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    [FileStatus.Failed]: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export const FileList: React.FC = () => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [count, setCount] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileRecord | null>(null);
  const { addToast } = useToast();

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('files')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      if (data) setFiles(data);
      if (count) setCount(count);

    } catch (error: any) {
      addToast(`Error fetching files: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, addToast]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    const channel = supabase.channel('public:files')
      .on<FileRecord>('postgres_changes', { event: '*', schema: 'public', table: 'files' }, payload => {
        fetchFiles(); // Refresh on changes
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFiles]);

  const handleDelete = async () => {
    if (!fileToDelete) return;
    try {
      const { error } = await supabase.from('files').delete().match({ id: fileToDelete.id });
      if (error) throw error;
      addToast('File deleted successfully.', 'success');
      setFiles(files.filter(f => f.id !== fileToDelete.id));
      setIsModalOpen(false);
      setFileToDelete(null);
    } catch (error: any) {
      addToast(error.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
           <Input 
            id="search"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
            }}
            />
        </div>
        <div className="flex items-center text-sm text-zinc-400">
            {count !== null && <span>{count} total documents</span>}
        </div>
      </div>

      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 font-semibold text-white">Name</th>
                <th className="px-6 py-4 font-semibold text-white">Category</th>
                <th className="px-6 py-4 font-semibold text-white">Size</th>
                <th className="px-6 py-4 font-semibold text-white">Status</th>
                <th className="px-6 py-4 font-semibold text-white">Date</th>
                <th className="px-6 py-4 font-semibold text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500">Loading data...</td></tr>
              ) : files.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500">No documents found.</td></tr>
              ) : (
                files.map((file) => (
                  <tr key={file.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                         <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                         </svg>
                        <div className="flex flex-col">
                            <span>{file.name}</span>
                            {file.video_url && (
                                <a href={file.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                                    Video Attached
                                </a>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{file.category}</td>
                    <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{file.size_mb.toFixed(2)} MB</td>
                    <td className="px-6 py-4"><StatusBadge status={file.status} /></td>
                    <td className="px-6 py-4 text-zinc-500">{new Date(file.upload_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setFileToDelete(file); setIsModalOpen(true); }} className="text-zinc-500 hover:text-rose-400 transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Delete Document">
        <p className="text-zinc-300">
            Permanently remove <strong className="text-white">{fileToDelete?.name}</strong> from the knowledge base? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};