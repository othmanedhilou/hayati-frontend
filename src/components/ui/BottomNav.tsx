'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wrench, MessageCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/', icon: Home, label: 'Accueil' },
  { href: '/services', icon: Wrench, label: 'Services' },
  { href: '/chat', icon: MessageCircle, label: 'AI Chat' },
  { href: '/auth', icon: User, label: 'Profil' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5">
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400'}`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
