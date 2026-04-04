'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wrench, MessageCircle, User, FileText, Car, Wallet, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/', icon: Home, label: 'Accueil' },
  { href: '/documents', icon: FileText, label: 'Documents' },
  { href: '/transport', icon: Car, label: 'Transport' },
  { href: '/money', icon: Wallet, label: 'Budget' },
  { href: '/services', icon: Wrench, label: 'Services' },
  { href: '/prices', icon: ShoppingCart, label: 'Prix' },
  { href: '/chat', icon: MessageCircle, label: 'AI Chat' },
  { href: '/auth', icon: User, label: 'Profil' },
];

const mobileItems = [
  { href: '/', icon: Home, label: 'Accueil' },
  { href: '/services', icon: Wrench, label: 'Services' },
  { href: '/chat', icon: MessageCircle, label: 'AI Chat' },
  { href: '/auth', icon: User, label: 'Profil' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* ============ DESKTOP TOP NAV (lg+) ============ */}
      <header className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 flex items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mr-10 shrink-0">
            <img src="/logo.png" alt="HAYATI" className="h-9 w-9 rounded-lg" />
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 tracking-tight leading-none">HAYATI</h1>
              <p className="text-[9px] text-gray-400 font-medium">حياتك أسهل</p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1 flex-1">
            {navItems.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}>
                    <item.icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
                    <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="topNavActive"
                        className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ============ MOBILE BOTTOM NAV (<lg) ============ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div className="bg-white/90 backdrop-blur-2xl border border-gray-200/60 shadow-[0_-4px_40px_rgba(0,0,0,0.08)] rounded-2xl mx-1">
            <div className="flex justify-around items-center h-16 px-2">
              {mobileItems.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative flex flex-col items-center justify-center gap-0.5 w-16 py-1"
                  >
                    <motion.div
                      animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -2 : 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      whileTap={{ scale: 0.85 }}
                      className={`p-2 rounded-2xl transition-all duration-200 ${
                        isActive ? 'bg-emerald-50 shadow-sm shadow-emerald-100' : ''
                      }`}
                    >
                      <item.icon
                        size={22}
                        strokeWidth={isActive ? 2.4 : 1.8}
                        className={`transition-colors duration-200 ${
                          isActive ? 'text-emerald-600' : 'text-gray-400'
                        }`}
                      />
                    </motion.div>

                    <span
                      className={`text-[10px] tracking-wide transition-all duration-200 ${
                        isActive ? 'font-bold text-emerald-600' : 'font-medium text-gray-400'
                      }`}
                    >
                      {item.label}
                    </span>

                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          layoutId="activeNavDot"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute -bottom-0.5 w-5 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                        />
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
