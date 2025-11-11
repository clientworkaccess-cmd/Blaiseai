
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useToast } from '../hooks/useToast';
import { FileRecord, FileStatus } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';

const PAGE_SIZE = 10;

const StatusBadge: React.FC<{ status: FileStatus }> = ({ status }) => {
  const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
  const statusClasses = {
    [FileStatus.Processing]: 'bg-yellow-100 text-yellow-800',
    [FileStatus.Processed]: 'bg-emerald-100 text-emerald-800',
    [FileStatus.Failed]: 'bg-rose-100 text-rose-800',
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
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
        console.log('Change received!', payload);
        const updatedFile = payload.new as FileRecord;
        const oldFile = payload.old as FileRecord;
        setFiles(currentFiles =>
          currentFiles.map(file => (file.id === updatedFile.id ? updatedFile : file))
        );
        if (oldFile?.status === 'processing' && (updatedFile.status === 'processed' || updatedFile.status === 'failed')) {
          addToast(`File "${updatedFile.name}" is now ${updatedFile.status}.`, updatedFile.status === 'processed' ? 'success' : 'error');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addToast]);

  const handleDelete = async () => {
    if (!fileToDelete) return;

    try {
      const { error } = await supabase.from('files').delete().match({ id: fileToDelete.id });
      if (error) throw error;
      addToast(`File "${fileToDelete.name}" deleted successfully.`, 'success');
      setFiles(files.filter(f => f.id !== fileToDelete.id));
      setIsModalOpen(false);
      setFileToDelete(null);
    } catch (error: any) {
      addToast(`Error deleting file: ${error.message}`, 'error');
    }
  };
  
  const openDeleteModal = (file: FileRecord) => {
    setFileToDelete(file);
    setIsModalOpen(true);
  };

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">File List</h1>
      <div className="mt-4">
        <Input 
          id="search"
          type="text"
          placeholder="Search by name or category..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
        />
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Size (MB)</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Uploaded</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <tr><td colSpan={6} className="text-center p-6 text-gray-500">Loading...</td></tr>
                  ) : files.length === 0 ? (
                     <tr><td colSpan={6} className="text-center p-6 text-gray-500">No files found.</td></tr>
                  ) : (
                    files.map((file) => (
                      <tr key={file.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{file.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{file.category}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{file.size_mb.toFixed(2)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <StatusBadge status={file.status} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(file.upload_date).toLocaleDateString()}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button onClick={() => openDeleteModal(file)} className="text-rose-600 hover:text-rose-900">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <Button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</Button>
          <span className="text-sm text-gray-700">Page {page + 1} of {totalPages}</span>
          <Button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Next</Button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Delete File">
        <p className="text-sm text-gray-500">Are you sure you want to delete "{fileToDelete?.name}"? This action cannot be undone.</p>
        <div className="mt-4 flex justify-end space-x-2">
           <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
           <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};
