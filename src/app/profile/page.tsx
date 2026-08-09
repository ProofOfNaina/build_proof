'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Navbar } from '@/components/Navbar';
import { SidebarLeft } from '@/components/SidebarLeft';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useShelbyUpload } from '@/hooks/useShelbyUpload';
import { User, Mail, MapPin, Link as LinkIcon, Edit2, Camera, FileText, Check, Loader2, Globe, Github, Twitter, Linkedin, Plus } from 'lucide-react';

export default function ProfilePage() {
  const { account } = useWallet();
  const queryClient = useQueryClient();
  const { uploadFile, isUploading } = useShelbyUpload();
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

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', account?.address?.toString()],
    queryFn: async () => {
      if (!account?.address) return null;
      const response = await axios.get(`/api/users/${account.address.toString()}`);
      return response.data;
    },
    enabled: !!account?.address,
  });

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
      await axios.post('/api/users', {
        wallet: account.address.toString(),
        ...data,
      });
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user', account?.address?.toString()] });
    },
  });

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !account?.address) return;

    try {
      const url = await uploadFile(file, `resumes/${account.address.toString()}/${file.name}`);
      if (url) {
        updateProfileMutation.mutate({ ...formData, resumeUrl: url });
      }
    } catch (error) {
      console.error('Resume upload failed:', error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !account?.address) return;

    try {
      const url = await uploadFile(file, `avatars/${account.address.toString()}/${file.name}`);
      if (url) {
        updateProfileMutation.mutate({ ...formData, avatarUrl: url });
      }
    } catch (error) {
      console.error('Avatar upload failed:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (!account) {
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
              <div className="h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative">
                <button className="absolute bottom-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-all">
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <div className="px-8 pb-8 -mt-16 relative">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                  <div className="relative group">
                      <div className="w-32 h-32 rounded-3xl border-8 border-white overflow-hidden shadow-xl bg-slate-100">
                        <img 
                          src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${account.address.toString()}`} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-3xl">
                      <Camera className="w-8 h-8 text-white" />
                      <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                    </label>
                  </div>
                  <div className="flex gap-3">
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
                    {isEditing && (
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
                  {isEditing ? (
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
                      <p className="text-slate-500 mt-2 max-w-2xl leading-relaxed">{user?.bio || 'No bio provided yet. Click edit to add your professional summary.'}</p>
                      
                      <div className="flex flex-wrap gap-6 mt-6">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <MapPin className="w-4 h-4 text-indigo-600" />
                          {user?.location || 'Remote'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Mail className="w-4 h-4 text-indigo-600" />
                          {account.address.toString().slice(0, 8)}...{account.address.toString().slice(-8)}
                        </div>
                        {user?.website && (
                          <a href={user.website} target="_blank" rel="noopener" className="flex items-center gap-2 text-sm text-indigo-600 hover:underline">
                            <Globe className="w-4 h-4" />
                            Website
                          </a>
                        )}
                      </div>

                      <div className="flex gap-4 mt-8">
                        {user?.github && (
                          <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener" className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                        {user?.twitter && (
                          <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener" className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                            <Twitter className="w-5 h-5" />
                          </a>
                        )}
                        {user?.linkedin && (
                          <a href={user.linkedin} target="_blank" rel="noopener" className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
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
                <label className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-all cursor-pointer">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {user?.resumeUrl ? 'Update Resume' : 'Upload Resume'}
                  <input type="file" className="hidden" onChange={handleResumeUpload} accept=".pdf,.doc,.docx" />
                </label>
              </div>

              {user?.resumeUrl ? (
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <FileText className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Resume.pdf</h4>
                      <p className="text-xs text-slate-500">Stored securely on Shelby Protocol</p>
                    </div>
                  </div>
                  <a 
                    href={user.resumeUrl} 
                    target="_blank" 
                    rel="noopener"
                    className="px-6 py-2.5 bg-white text-slate-700 text-sm font-bold rounded-xl border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                  >
                    View Document
                  </a>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h4 className="font-bold text-slate-900 mb-1">No resume uploaded</h4>
                  <p className="text-xs text-slate-500">Upload your resume to Shelby Protocol to showcase your experience.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
