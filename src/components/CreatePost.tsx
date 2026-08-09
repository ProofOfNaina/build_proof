'use client';

import React, { useState, useRef } from 'react';
import { Image as ImageIcon, FileText, Send, Loader2, X } from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useShelbyUpload, sanitizeFileName } from '@/hooks/useShelbyUpload';
import { useAuthHeaders } from '@/hooks/useAuthHeaders';
import { errorMessage } from '@/lib/errorMessage';
import axios from 'axios';

interface CreatePostProps {
  onPostCreated?: () => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { account, connected } = useWallet();
  const { uploadFile, isUploading } = useShelbyUpload();
  const authHeaders = useAuthHeaders();
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async () => {
    if (!connected || !account) {
      alert('Please connect your wallet first.');
      return;
    }
    if (!content.trim() && !selectedFile) return;

    try {
      let mediaUrl = '';
      let explorerUrl = '';
      if (selectedFile) {
        const timestamp = Date.now();
        const path = `posts/${timestamp}-${sanitizeFileName(selectedFile.name)}`;
        const result = await uploadFile(selectedFile, path);
        mediaUrl = result.url;
        explorerUrl = result.explorerUrl;
      }

      await axios.post(
        '/api/posts',
        {
          author: account.address.toString(),
          content: content,
          mediaUrl: mediaUrl,
          explorerUrl: explorerUrl,
        },
        { headers: await authHeaders() },
      );

      setContent('');
      clearFile();
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error('Failed to create post:', error);
      alert(errorMessage(error, 'Failed to create post. Please try again.'));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 card-shadow mb-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${account?.address?.toString() || 'default'}`} 
            alt="Profile" 
            className="w-full h-full object-cover bg-slate-100"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={connected ? "What's on your mind?" : "Connect wallet to post..."}
            disabled={!connected || isUploading}
            className="w-full bg-slate-100/80 hover:bg-slate-100 text-slate-900 text-sm font-medium py-2.5 px-4 rounded-xl transition-all outline-none border-none resize-none min-h-[100px]"
          />
          
          {previewUrl && (
            <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200">
              <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[300px] object-cover" />
              <button 
                onClick={clearFile}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept="image/*,video/*"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={!connected || isUploading}
            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all text-xs font-bold disabled:opacity-50"
          >
            <ImageIcon className="w-4 h-4 text-indigo-500" />
            Image
          </button>
          <button 
            disabled={!connected || isUploading}
            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all text-xs font-bold disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-emerald-500" />
            Document
          </button>
        </div>
        <button 
          onClick={handlePost}
          disabled={(!content.trim() && !selectedFile) || isUploading || !connected}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              Post
              <Send className="w-3 h-3" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
