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
}

export default function ModuleCard({ title, titleAr, icon: Icon, href, gradient, description }: ModuleCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg cursor-pointer ${gradient}`}
      >
        <div className="absolute top-2 right-2 opacity-15">
          <Icon size={64} />
        </div>
        <div className="relative z-10">
          <Icon size={28} className="mb-3" />
          <h3 className="font-bold text-lg">{title}</h3>
          {titleAr && <p className="text-sm opacity-80 font-arabic">{titleAr}</p>}
          <p className="text-xs mt-1 opacity-75">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
}
