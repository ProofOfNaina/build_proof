import React from 'react';
import { Building2, MapPin, Clock, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  type?: string;
  salary?: string;
  logo?: string;
  description?: string;
}

export const JobCard: React.FC<JobCardProps> = ({ title, company, location, type = 'Full-time', salary = 'Competitive', logo, description }) => {
  const defaultLogo = `https://api.dicebear.com/7.x/initials/svg?seed=${company}`;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ 
        x: 4,
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      className="bg-white rounded-2xl border border-slate-200 p-5 card-shadow hover:border-indigo-200 transition-all group cursor-pointer card-3d"
    >
      <div className="flex items-start gap-4">
        <motion.div 
          whileHover={{ rotate: -5, scale: 1.1 }}
          className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm"
        >
          <img 
            src={logo || defaultLogo} 
            alt={company} 
            className="w-10 h-10 object-contain" 
            referrerPolicy="no-referrer" 
          />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                <Building2 className="w-3.5 h-3.5" />
                {company}
              </div>
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
            >
              Apply
            </motion.button>
          </div>
          
          {description && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2">{description}</p>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {location}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {type}
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              {salary}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
