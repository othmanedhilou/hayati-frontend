'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ModuleCardProps {
  title: string;
  titleAr?: string;
  icon: LucideIcon;
  href: string;
  gradient: string;
  description: string;
  color?: string;
}

const colorMap: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  blue:    { bg: 'bg-blue-500/8',    text: 'text-blue-600',    border: 'border-blue-200/40',    iconBg: 'bg-blue-500/12' },
  purple:  { bg: 'bg-purple-500/8',  text: 'text-purple-600',  border: 'border-purple-200/40',  iconBg: 'bg-purple-500/12' },
  emerald: { bg: 'bg-emerald-500/8', text: 'text-emerald-600', border: 'border-emerald-200/40', iconBg: 'bg-emerald-500/12' },
  orange:  { bg: 'bg-orange-500/8',  text: 'text-orange-600',  border: 'border-orange-200/40',  iconBg: 'bg-orange-500/12' },
  pink:    { bg: 'bg-pink-500/8',    text: 'text-pink-600',    border: 'border-pink-200/40',    iconBg: 'bg-pink-500/12' },
};

export default function ModuleCard({ title, titleAr, icon: Icon, href, gradient, description, color }: ModuleCardProps) {
  const palette = colorMap[color || 'emerald'] || colorMap.emerald;

  return (
    <Link href={href} className="block">
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        className={`group relative overflow-hidden rounded-2xl p-5 cursor-pointer bg-white/70 backdrop-blur-md border ${palette.border} shadow-sm hover:shadow-lg transition-shadow duration-300`}
      >
        <div className={`absolute inset-0 ${palette.bg} rounded-2xl pointer-events-none`} />
        <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-white/80 via-white/40 to-white/10" />

        <div className={`absolute -top-2 -right-2 pointer-events-none opacity-[0.04] ${palette.text}`}>
          <Icon size={90} strokeWidth={1} />
        </div>

        <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        <div className="relative z-10">
          <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-3 ${palette.iconBg}`}>
            <Icon size={22} strokeWidth={2} className={palette.text} />
          </div>
          <h3 className={`font-bold text-base leading-tight ${palette.text}`}>{title}</h3>
          {titleAr && <p className="text-sm text-gray-400 mt-0.5" dir="rtl">{titleAr}</p>}
          <p className="text-xs text-gray-500/80 mt-1.5 leading-relaxed line-clamp-2">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
}
