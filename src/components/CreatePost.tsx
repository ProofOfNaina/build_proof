'use client';

import React, { useState, useRef } from 'react';
import { Image as ImageIcon, FileText, Send, Loader2, X, AlertTriangle } from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useShelbyUpload } from '@/hooks/useShelbyUpload';
import { useAuthHeaders } from '@/hooks/useAuthHeaders';
import { errorMessage } from '@/lib/errorMessage';
import {
  buildBlobName,
  detectMediaKind,
  formatBytes,
  validateUpload,
  IMAGE_ACCEPT_ATTRIBUTE,
  PDF_ACCEPT_ATTRIBUTE,
  type MediaKind,
} from '@/lib/uploadFiles';
import axios from 'axios';

interface CreatePostProps {
  onPostCreated?: () => void;
}

interface Attachment {
  file: File;
  kind: MediaKind;
  /** Object URL for image previews. Revoked when the attachment is cleared. */
  previewUrl: string | null;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { account, connected } = useWallet();
  const { uploadFile, isUploading, stageLabel, progress, wrongNetwork, walletChainId, expectedChainId, requiredNetwork } =
    useShelbyUpload();
  const authHeaders = useAuthHeaders();
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const clearFile = React.useCallback(() => {
    setAttachment((current) => {
      // Object URLs leak until revoked.
      if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  }, []);

  React.useEffect(() => clearFile, [clearFile]);

  const handleFileSelect = (allowed: MediaKind[]) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate before anything else: no wallet prompt for a file we'd reject.
    const rejection = validateUpload(file, allowed);
    if (rejection) {
      alert(rejection);
      e.target.value = '';
      return;
    }

    const kind = detectMediaKind(file)!;
    clearFile();
    setAttachment({
      file,
      kind,
      previewUrl: kind === 'image' ? URL.createObjectURL(file) : null,
    });
  };

  const handlePost = async () => {
    if (!connected || !account) {
      alert('Please connect your wallet first.');
      return;
    }
    if (!content.trim() && !attachment) return;

    try {
      let mediaUrl = '';
      let explorerUrl = '';
      let mediaType = '';

      if (attachment) {
        const blobName = buildBlobName('posts', attachment.file.name);
        const result = await uploadFile(attachment.file, blobName, [attachment.kind]);
        mediaUrl = result.url;
        explorerUrl = result.explorerUrl;
        mediaType = result.kind;
      }

      await axios.post(
        '/api/posts',
        {
          author: account.address.toString(),
          content,
          mediaUrl,
          explorerUrl,
          mediaType,
          mediaName: attachment?.file.name ?? '',
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

  const busy = isUploading;

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
            placeholder={connected ? "What's on your mind?" : 'Connect wallet to post...'}
            disabled={!connected || busy}
            className="w-full bg-slate-100/80 hover:bg-slate-100 text-slate-900 text-sm font-medium py-2.5 px-4 rounded-xl transition-all outline-none border-none resize-none min-h-[100px]"
          />

          {attachment?.kind === 'image' && attachment.previewUrl && (
            <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200">
              <img
                src={attachment.previewUrl}
                alt="Preview"
                className="w-full h-auto max-h-[300px] object-cover"
              />
              <button
                onClick={clearFile}
                disabled={busy}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {attachment?.kind === 'pdf' && (
            <div className="mt-3 flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{attachment.file.name}</p>
                <p className="text-[11px] text-slate-500">
                  PDF • {formatBytes(attachment.file.size)}
                </p>
              </div>
              <button
                onClick={clearFile}
                disabled={busy}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full transition-all disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {wrongNetwork && (
            <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Your wallet is on <strong>chain {walletChainId}</strong>, but files are stored on{' '}
                <strong>{requiredNetwork}</strong> (<strong>chain {expectedChainId}</strong>) —
                separate chains. Switch networks in your wallet to attach a file.
              </p>
            </div>
          )}

          {busy && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                <span>{stageLabel}</span>
                {progress > 0 && <span>{Math.round(progress * 100)}%</span>}
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${Math.max(progress * 100, 8)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleFileSelect(['image'])}
            className="hidden"
            accept={IMAGE_ACCEPT_ATTRIBUTE}
          />
          <input
            type="file"
            ref={pdfInputRef}
            onChange={handleFileSelect(['pdf'])}
            className="hidden"
            accept={PDF_ACCEPT_ATTRIBUTE}
          />
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={!connected || busy || wrongNetwork}
            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all text-xs font-bold disabled:opacity-50"
          >
            <ImageIcon className="w-4 h-4 text-indigo-500" />
            Image
          </button>
          <button
            onClick={() => pdfInputRef.current?.click()}
            disabled={!connected || busy || wrongNetwork}
            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all text-xs font-bold disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-rose-500" />
            PDF
          </button>
        </div>
        <button
          onClick={handlePost}
          disabled={(!content.trim() && !attachment) || busy || !connected}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
        >
          {busy ? (
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
