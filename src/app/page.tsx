'use client';

import { useAuth } from '@/contexts/AuthContext';
import ModuleCard from '@/components/ui/ModuleCard';
import { motion } from 'framer-motion';
import { FileText, Car, Wallet, Wrench, ShoppingCart, Search, AlertTriangle, Tag } from 'lucide-react';
import Link from 'next/link';

const modules = [
  { title: 'Documents', titleAr: 'الوثائق', icon: FileText, href: '/documents', gradient: 'bg-gradient-to-br from-blue-500 to-blue-700', description: 'CIN, permis, assurance...' },
  { title: 'Transport', titleAr: 'النقل', icon: Car, href: '/transport', gradient: 'bg-gradient-to-br from-purple-500 to-purple-700', description: 'Comparer taxi, train, bus' },
  { title: 'Budget', titleAr: 'الميزانية', icon: Wallet, href: '/money', gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-700', description: 'Gérer vos dépenses' },
  { title: 'Services', titleAr: 'الخدمات', icon: Wrench, href: '/services', gradient: 'bg-gradient-to-br from-orange-500 to-orange-700', description: 'Plombier, électricien...' },
  { title: 'Prix', titleAr: 'الأسعار', icon: ShoppingCart, href: '/prices', gradient: 'bg-gradient-to-br from-pink-500 to-pink-700', description: 'Comparer BIM, Marjane...' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="px-4 pt-8 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Salam, {user?.name || 'Bienvenue'} 👋
        </h1>
        <p className="text-gray-500 mt-1">Que cherchez-vous aujourd&apos;hui?</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text" placeholder="Rechercher un service, produit..."
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-gray-200 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
            readOnly
          />
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 mb-8">
        {modules.map((mod) => (
          <motion.div key={mod.href} variants={item}>
            <ModuleCard {...mod} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Suggestions IA ✨</h2>
        <div className="space-y-3">
          <Link href="/documents">
            <motion.div whileTap={{ scale: 0.98 }} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <div className="bg-amber-100 rounded-xl p-2"><AlertTriangle size={20} className="text-amber-600" /></div>
              <div>
                <p className="font-semibold text-amber-800 text-sm">Assurance auto expire bientôt</p>
                <p className="text-amber-600 text-xs mt-0.5">Pensez à renouveler avant septembre 2026</p>
              </div>
            </motion.div>
          </Link>
          <Link href="/prices">
            <motion.div whileTap={{ scale: 0.98 }} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
              <div className="bg-emerald-100 rounded-xl p-2"><Tag size={20} className="text-emerald-600" /></div>
              <div>
                <p className="font-semibold text-emerald-800 text-sm">Promo BIM: Huile d&apos;olive -20%</p>
                <p className="text-emerald-600 text-xs mt-0.5">Économisez 7 DH cette semaine</p>
              </div>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
