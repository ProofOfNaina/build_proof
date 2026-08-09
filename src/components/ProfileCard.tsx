import React from 'react';
import { MapPin, Building2, Link as LinkIcon, Edit3, MessageSquare, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

export const ProfileCard: React.FC = () => {
  const skills = ['Product Design', 'UI/UX', 'React', 'Figma', 'System Design', 'Prototyping'];
  const projects = [
    { title: 'BuildProof UI Kit', desc: 'A comprehensive design system for professional platforms.', img: 'project1' },
    { title: 'EcoTrack App', desc: 'Sustainability tracking mobile application.', img: 'project2' },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto pb-12">
      {/* Top Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden card-shadow card-3d"
      >
        <div className="h-56 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
          <motion.div 
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <button className="absolute top-6 right-6 p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-all border border-white/20">
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
        <div className="px-10 pb-10">
          <div className="relative flex justify-between items-end -mt-20 mb-8">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="w-40 h-40 rounded-[2.5rem] border-[10px] border-white overflow-hidden shadow-2xl bg-white"
            >
              <img 
                src="https://picsum.photos/seed/user1/200/200" 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="flex gap-4 mb-4">
              <motion.button 
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Connect
              </motion.button>
              <motion.button 
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </motion.button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Alex Rivera</h1>
              <p className="text-xl text-slate-600 font-medium mt-1">Senior Product Designer @ BuildProof</p>
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-500" />
                San Francisco, CA
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-500" />
                BuildProof Inc.
              </div>
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-emerald-500" />
                <a href="#" className="text-indigo-600 hover:underline">alexrivera.design</a>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed max-w-3xl text-lg">
              Passionate about creating intuitive digital experiences that bridge the gap between technology and human needs. Currently leading the design team at BuildProof to redefine professional networking.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl border border-slate-200 p-8 card-shadow"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">About</h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              With over 8 years of experience in product design, I&apos;ve worked with startups and Fortune 500 companies to launch products used by millions. My approach combines data-driven insights with empathetic design thinking to solve complex problems.
            </p>
          </motion.div>

          {/* Projects Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl border border-slate-200 p-8 card-shadow"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -8 }}
                  className="group cursor-pointer"
                >
                  <div className="aspect-video rounded-2xl overflow-hidden mb-5 border border-slate-100 shadow-sm relative">
                    <img 
                      src={`https://picsum.photos/seed/${project.img}/600/400`} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{project.title}</h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{project.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          {/* Skills Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl border border-slate-200 p-8 card-shadow"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Skills</h2>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, i) => (
                <motion.span 
                  key={i} 
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-5 py-2.5 bg-slate-50 text-slate-700 rounded-2xl text-sm font-bold border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all cursor-default shadow-sm"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
