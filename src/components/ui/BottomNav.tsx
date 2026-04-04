'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wrench, MessageCircle, User, FileText, Car, Wallet, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/', icon: Home, label: 'Accueil' },
  { href: '/services', icon: Wrench, label: 'Services' },
  { href: '/chat', icon: MessageCircle, label: 'AI Chat' },
  { href: '/auth', icon: User, label: 'Profil' },
];

const sidebarModules = [
  { href: '/documents', icon: FileText, label: 'Documents' },
  { href: '/transport', icon: Car, label: 'Transport' },
  { href: '/money', icon: Wallet, label: 'Budget' },
  { href: '/prices', icon: ShoppingCart, label: 'Prix' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* ============ DESKTOP SIDEBAR (lg+) ============ */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-white/80 backdrop-blur-2xl border-r border-gray-200/60 flex-col z-50">
        {/* Logo */}
        <div className="px-7 pt-7 pb-5">
          <Link href="/" className="flex items-center gap-3.5">
            <img src="/logo.png" alt="HAYATI" className="h-12 w-12 rounded-xl" />
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">HAYATI</h1>
              <p className="text-[11px] text-gray-400 font-medium -mt-0.5">حياتك أسهل</p>
            </div>
          </Link>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-4 mt-4">
          <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold px-4 mb-3">Menu</p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}>
                    <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span className={`text-[15px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="sidebarActive"
                        className="ml-auto w-1.5 h-6 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8">
            <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold px-4 mb-3">Modules</p>
            <div className="space-y-1">
              {sidebarModules.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}>
                      <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                      <span className={`text-[15px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Bottom branding */}
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">HAYATI v1.0</p>
          <p className="text-[10px] text-gray-300 mt-0.5">ETH 2026 - EMSI Rabat</p>
        </div>
      </aside>

      {/* ============ MOBILE BOTTOM NAV (<lg) ============ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div className="bg-white/90 backdrop-blur-2xl border border-gray-200/60 shadow-[0_-4px_40px_rgba(0,0,0,0.08)] rounded-2xl mx-1">
            <div className="flex justify-around items-center h-16 px-2">
              {navItems.map((item) => {
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
