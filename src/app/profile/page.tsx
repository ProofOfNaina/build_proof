'use client';

import React, { Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Navbar } from '@/components/Navbar';
import { SidebarLeft } from '@/components/SidebarLeft';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useShelbyUpload } from '@/hooks/useShelbyUpload';
import { buildBlobName, IMAGE_ACCEPT_ATTRIBUTE, PDF_ACCEPT_ATTRIBUTE } from '@/lib/uploadFiles';
import { useAuthHeaders } from '@/hooks/useAuthHeaders';
import { FundWallet } from '@/components/FundWallet';
import { errorMessage } from '@/lib/errorMessage';
import { User, Mail, MapPin, Edit2, Camera, FileText, Check, Loader2, Globe, Github, Twitter, Linkedin, Plus, AlertTriangle, Database, ExternalLink, HardDrive } from 'lucide-react';
import { shelbyClient, shelbyRpcBaseUrl, shelbyNetwork } from '@/lib/shelbyClient';
import { getShelbyAccountExplorerUrl } from '@shelby-protocol/sdk/browser';

function ProfileView() {
  const { account } = useWallet();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { uploadFile, isUploading, stageLabel, progress, wrongNetwork, walletChainId, expectedChainId, requiredNetwork } =
    useShelbyUpload();
  const authHeaders = useAuthHeaders();

  // `/profile?wallet=0x…` views someone else's profile; bare `/profile` is your
  // own. Only the latter is editable.
  const viewedWallet = searchParams.get('wallet') || account?.address?.toString() || null;
  const isOwnProfile = !!account?.address && viewedWallet === account.address.toString();

  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    github: '',
    twitter: '',
    linkedin: '',
  });

  const { data: user } = useQuery({
    queryKey: ['user', viewedWallet],
    queryFn: async () => {
      if (!viewedWallet) return null;
      try {
        const response = await axios.get(`/api/users/${viewedWallet}`);
        return response.data;
      } catch (error) {
        // A wallet with no saved profile yet is expected, not an error.
        if (axios.isAxiosError(error) && error.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: !!viewedWallet,
  });

  const { data: shelbyBlobs, isLoading: isLoadingBlobs } = useQuery({
    queryKey: ['shelbyBlobs', viewedWallet],
    queryFn: async () => {
      if (!viewedWallet || !shelbyClient?.coordination?.getAccountBlobs) return [];
      try {
        const blobs = await shelbyClient.coordination.getAccountBlobs({ account: viewedWallet });
        return blobs || [];
      } catch (err) {
        console.warn('Could not fetch Shelby blobs:', err);
        return [];
      }
    },
    enabled: !!viewedWallet,
  });

  const explorerAccountUrl = viewedWallet ? getShelbyAccountExplorerUrl(shelbyNetwork, viewedWallet) : null;

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        github: user.github || '',
        twitter: user.twitter || '',
        linkedin: user.linkedin || '',
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!account?.address) return;
      await axios.post(
        '/api/users',
        { wallet: account.address.toString(), ...data },
        { headers: await authHeaders() },
      );
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user', account?.address?.toString()] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      alert(errorMessage(error, 'Failed to save your profile. Please try again.'));
    },
  });

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !account?.address) return;

    try {
      // uploadFile resolves to { url, explorerUrl, ... } — the stored field is url.
      const blobName = buildBlobName(`resumes/${account.address.toString()}`, file.name);
      const { url } = await uploadFile(file, blobName, ['pdf']);
      updateProfileMutation.mutate({ ...formData, resumeUrl: url, resumeName: file.name });
    } catch (error) {
      console.error('Resume upload failed:', error);
      alert(errorMessage(error, 'Resume upload failed. Please try again.'));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !account?.address) return;

    try {
      const blobName = buildBlobName(`avatars/${account.address.toString()}`, file.name);
      const { url } = await uploadFile(file, blobName, ['image']);
      updateProfileMutation.mutate({ ...formData, avatarUrl: url });
    } catch (error) {
      console.error('Avatar upload failed:', error);
      alert(errorMessage(error, 'Avatar upload failed. Please try again.'));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  // Only blocks when there is nothing to show: a `?wallet=` profile is public.
  if (!viewedWallet) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center bg-white p-12 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect your wallet</h2>
            <p className="text-slate-500 mb-8">Please connect your Petra wallet to view and manage your professional profile on BuildProof.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="flex gap-8">
          <SidebarLeft />

          <div className="flex-1 min-w-0">
            {/* Profile Header */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden card-shadow mb-8">
              <div className="h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative" />
              <div className="px-8 pb-8 -mt-16 relative">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                  <div className="relative group">
                      <div className="w-32 h-32 rounded-3xl border-8 border-white overflow-hidden shadow-xl bg-slate-100">
                        <img
                          src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewedWallet}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewedWallet}`;
                          }}
                        />
                      </div>
                    {isOwnProfile && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-3xl">
                        <Camera className="w-8 h-8 text-white" />
                        <input type="file" className="hidden" onChange={handleAvatarUpload} accept={IMAGE_ACCEPT_ATTRIBUTE} disabled={isUploading || wrongNetwork} />
                      </label>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {isOwnProfile && (
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all border border-slate-200"
                      >
                        {isEditing ? 'Cancel' : (
                          <>
                            <Edit2 className="w-4 h-4" />
                            Edit Profile
                          </>
                        )}
                      </button>
                    )}
                    {isOwnProfile && isEditing && (
                      <button 
                        onClick={handleSubmit}
                        disabled={updateProfileMutation.isPending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                      >
                        {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Save Changes
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  {isOwnProfile && isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                          <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bio</label>
                          <textarea 
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all h-24 resize-none"
                            placeholder="Tell us about yourself"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Location</label>
                          <input 
                            type="text" 
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="City, Country"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Website</label>
                          <input 
                            type="text" 
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">GitHub</label>
                          <input 
                            type="text" 
                            value={formData.github}
                            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="GitHub username"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Twitter</label>
                          <input 
                            type="text" 
                            value={formData.twitter}
                            onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="Twitter handle"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">LinkedIn</label>
                          <input 
                            type="text" 
                            value={formData.linkedin}
                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="LinkedIn profile URL"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-black text-slate-900">{user?.name || 'Anonymous User'}</h1>
                      <p className="text-slate-500 mt-2 max-w-2xl leading-relaxed">
                        {user?.bio || (isOwnProfile
                          ? 'No bio provided yet. Click edit to add your professional summary.'
                          : 'This member has not added a bio yet.')}
                      </p>

                      <div className="flex flex-wrap gap-6 mt-6">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <MapPin className="w-4 h-4 text-indigo-600" />
                          {user?.location || 'Remote'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Mail className="w-4 h-4 text-indigo-600" />
                          {viewedWallet.slice(0, 8)}...{viewedWallet.slice(-8)}
                        </div>
                        {user?.website && (
                          <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-indigo-600 hover:underline">
                            <Globe className="w-4 h-4" />
                            Website
                          </a>
                        )}
                      </div>

                      <div className="flex gap-4 mt-8">
                        {user?.github && (
                          <a href={`https://github.com/${encodeURIComponent(user.github)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                        {user?.twitter && (
                          <a href={`https://twitter.com/${encodeURIComponent(user.twitter)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                            <Twitter className="w-5 h-5" />
                          </a>
                        )}
                        {user?.linkedin && (
                          <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                            <Linkedin className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Resume Section */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 card-shadow mb-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-indigo-600" />
                  Professional Resume
                </h2>
                {isOwnProfile && (
                  <label
                    className={`flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl transition-all ${
                      isUploading || wrongNetwork
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:bg-indigo-100 cursor-pointer'
                    }`}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {isUploading
                      ? `${stageLabel}${progress > 0 ? ` ${Math.round(progress * 100)}%` : ''}`
                      : user?.resumeUrl
                        ? 'Update Resume'
                        : 'Upload Resume'}
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleResumeUpload}
                      accept={PDF_ACCEPT_ATTRIBUTE}
                      disabled={isUploading || wrongNetwork}
                    />
                  </label>
                )}
              </div>

              {isOwnProfile && !wrongNetwork && (
                <div className="flex flex-wrap items-center gap-3 p-4 mb-6 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-600 flex-1 min-w-[16rem]">
                    Uploads need <strong>APT</strong> for gas and <strong>ShelbyUSD</strong> for
                    storage. Top up if an upload fails.
                  </p>
                  <FundWallet />
                </div>
              )}

              {isOwnProfile && wrongNetwork && (
                <div className="flex items-start gap-2 p-3 mb-6 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Your wallet is on <strong>chain {walletChainId}</strong>, but files are stored on{' '}
                    <strong>{requiredNetwork}</strong> (<strong>chain {expectedChainId}</strong>) —
                    separate chains. Switch networks in your wallet to upload.
                  </p>
                </div>
              )}

              {user?.resumeUrl ? (
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <FileText className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 truncate max-w-[16rem]">
                        {user.resumeName || 'Resume.pdf'}
                      </h4>
                      <p className="text-xs text-slate-500">Stored securely on Shelby Protocol</p>
                    </div>
                  </div>
                  <a
                    href={user.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-white text-slate-700 text-sm font-bold rounded-xl border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                  >
                    View Document
                  </a>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h4 className="font-bold text-slate-900 mb-1">No resume uploaded</h4>
                  <p className="text-xs text-slate-500">
                    {isOwnProfile
                      ? 'Upload your resume to Shelby Protocol to showcase your experience.'
                      : 'This member has not uploaded a resume yet.'}
                  </p>
                </div>
              )}
            </div>

            {/* Shelby Storage Blobs Section */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 card-shadow mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <Database className="w-6 h-6 text-indigo-600" />
                    Shelby Protocol Blobs
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    On-chain decentralized blobs uploaded by {isOwnProfile ? 'your wallet' : 'this member'}.
                  </p>
                </div>
                {explorerAccountUrl && (
                  <a
                    href={explorerAccountUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Shelby Explorer
                  </a>
                )}
              </div>

              {isLoadingBlobs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                </div>
              ) : shelbyBlobs && shelbyBlobs.length > 0 ? (
                <div className="space-y-3">
                  {shelbyBlobs.map((blob: any, idx: number) => {
                    const blobPath = blob.blobNameSuffix || blob.name || `blob-${idx}`;
                    const readUrl = `${shelbyRpcBaseUrl}/v1/blobs/${viewedWallet}/${blobPath}`;
                    const sizeKb = blob.size ? `${(blob.size / 1024).toFixed(1)} KB` : 'Unknown size';
                    const createdDate = blob.creationMicros
                      ? new Date(Number(blob.creationMicros) / 1000).toLocaleDateString()
                      : null;

                    return (
                      <div
                        key={blob.uid || idx}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                            <HardDrive className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{blobPath}</p>
                            <p className="text-[11px] text-slate-500">
                              {sizeKb} {createdDate ? `• Uploaded ${createdDate}` : ''}
                            </p>
                          </div>
                        </div>
                        {explorerAccountUrl && (
                          <a
                            href={explorerAccountUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Explorer
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-3xl">
                  <Database className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-900 text-sm mb-1">No blobs found on Shelby</h4>
                  <p className="text-xs text-slate-500">
                    {isOwnProfile
                      ? 'Upload a resume or post media to store blobs on Shelby Protocol.'
                      : 'No blobs registered for this wallet on Shelby Protocol.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  // `useSearchParams` needs a Suspense boundary to avoid opting the whole route
  // out of static rendering.
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-slate-50/50">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </main>
        </div>
      }
    >
      <ProfileView />
    </Suspense>
  );
}
