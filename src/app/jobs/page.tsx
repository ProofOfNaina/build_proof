'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Navbar } from '@/components/Navbar';
import { SidebarLeft } from '@/components/SidebarLeft';
import { JobCard } from '@/components/JobCard';
import { Briefcase, Search, MapPin, Filter } from 'lucide-react';

export default function JobsPage() {
  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const response = await axios.get('/api/jobs');
      return response.data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="flex gap-8">
          <SidebarLeft />

          <div className="flex-1 min-w-0">
            {/* Jobs Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 card-shadow">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search jobs, skills, or companies"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="w-full md:w-48 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Location"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <button className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95">
                  Search
                </button>
              </div>
              
              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition-all">
                  <Filter className="w-3.5 h-3.5" />
                  All Filters
                </button>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                  {['Remote', 'Full-time', 'Contract', 'Internship', 'Entry Level'].map((tag) => (
                    <button key={tag} className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 text-slate-500 text-xs font-bold rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-all">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Jobs List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2 px-2">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  Recommended for you
                </h2>
                <span className="text-xs text-slate-500 font-medium">{jobs?.length || 0} jobs found</span>
              </div>

              {jobs?.map((job: any) => (
                <JobCard key={job.id} {...job} />
              ))}

              {(!jobs || jobs.length === 0) && (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">No jobs found</h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">
                    We couldn&apos;t find any jobs matching your criteria. Try adjusting your search filters.
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
