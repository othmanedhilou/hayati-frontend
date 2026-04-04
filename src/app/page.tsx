'use client';

import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Car,
  Wallet,
  Wrench,
  ShoppingCart,
  Bot,
  Sparkles,
  AlertTriangle,
  Tag,
  TrendingUp,
  ArrowRight,
  LogIn,
  ChevronRight,
  Shield,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuickStats {
  documentsCount: number | null;
  monthlyBalance: number | null;
  promosCount: number | null;
}

interface DocumentItem {
  id: number;
  type: string;
  title?: string;
  expiry_date?: string;
  [key: string]: unknown;
}

interface PromoItem {
  id: number;
  name?: string;
  title?: string;
  discount?: number;
  discount_percent?: number;
  store?: string;
  [key: string]: unknown;
}

interface InsightCard {
  type: 'warning' | 'saving' | 'tip';
  title: string;
  subtitle: string;
  icon: typeof AlertTriangle;
  href: string;
}

// ---------------------------------------------------------------------------
// Module definitions
// ---------------------------------------------------------------------------

const modules = [
  {
    title: 'Documents',
    titleAr: 'الوثائق',
    icon: FileText,
    href: '/documents',
    color: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    iconColor: 'text-blue-600',
    description: 'CIN, permis, assurance...',
  },
  {
    title: 'Transport',
    titleAr: 'النقل',
    icon: Car,
    href: '/transport',
    color: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-50',
    iconColor: 'text-purple-600',
    description: 'Comparer taxi, train, bus',
  },
  {
    title: 'Budget',
    titleAr: 'الميزانية',
    icon: Wallet,
    href: '/money',
    color: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    description: 'Suivre vos dépenses',
  },
  {
    title: 'Services',
    titleAr: 'الخدمات',
    icon: Wrench,
    href: '/services',
    color: 'from-orange-500 to-orange-600',
    bgLight: 'bg-orange-50',
    iconColor: 'text-orange-600',
    description: 'Plombier, électricien...',
  },
  {
    title: 'Prix',
    titleAr: 'الأسعار',
    icon: ShoppingCart,
    href: '/prices',
    color: 'from-pink-500 to-pink-600',
    bgLight: 'bg-pink-50',
    iconColor: 'text-pink-600',
    description: 'Comparer BIM, Marjane...',
  },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
};

// ---------------------------------------------------------------------------
// Floating shapes for hero
// ---------------------------------------------------------------------------

function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10"
        animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-12 -left-6 w-20 h-20 rounded-2xl bg-white/8 rotate-12"
        animate={{ y: [0, 10, 0], rotate: [12, -4, 12] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-4 right-12 w-16 h-16 rounded-full bg-white/10"
        animate={{ y: [0, -8, 0], x: [0, 6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute top-6 right-1/3 w-10 h-10 rounded-lg bg-white/6 rotate-45"
        animate={{ y: [0, 14, 0], rotate: [45, 60, 45] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      />
      <motion.div
        className="absolute bottom-8 left-1/4 w-14 h-14 rounded-full bg-white/5"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper: format MAD currency
// ---------------------------------------------------------------------------

function formatMAD(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1000) {
    return `${(amount / 1000).toFixed(1)}k DH`;
  }
  return `${amount.toLocaleString('fr-MA')} DH`;
}

// ---------------------------------------------------------------------------
// Quick stat card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: string;
  icon: typeof FileText;
  color: string;
  loading: boolean;
}) {
  return (
    <motion.div
      variants={scaleIn}
      className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl p-3 shadow-sm border border-gray-100/80"
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
      {loading ? (
        <div className="h-5 w-16 bg-gray-200 rounded-lg animate-pulse" />
      ) : (
        <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
      )}
      <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Module card component
// ---------------------------------------------------------------------------

function ModuleCardPremium({
  title,
  titleAr,
  icon: Icon,
  href,
  color,
  bgLight,
  iconColor,
  description,
}: (typeof modules)[number]) {
  return (
    <Link href={href}>
      <motion.div
        variants={fadeUp}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="bg-white/70 backdrop-blur-lg rounded-2xl p-4 shadow-sm border border-white/60 hover:shadow-lg transition-shadow relative overflow-hidden group cursor-pointer"
      >
        {/* Gradient accent line at top */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color} opacity-80 group-hover:opacity-100 transition-opacity`} />

        <div className={`w-11 h-11 rounded-xl ${bgLight} flex items-center justify-center mb-3`}>
          <Icon size={22} className={iconColor} />
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-[15px]">{title}</h3>
          <span className="text-xs text-gray-400 font-arabic">{titleAr}</span>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>

        <div className={`absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity`}>
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </motion.div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Insight card component
// ---------------------------------------------------------------------------

function InsightCardComponent({ insight }: { insight: InsightCard }) {
  const isWarning = insight.type === 'warning';
  const Icon = insight.icon;

  return (
    <Link href={insight.href}>
      <motion.div
        variants={fadeUp}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`${
          isWarning
            ? 'bg-amber-50/80 border-amber-200/60'
            : 'bg-emerald-50/80 border-emerald-200/60'
        } backdrop-blur-sm border rounded-2xl p-4 flex items-start gap-3 cursor-pointer`}
      >
        <div
          className={`${
            isWarning ? 'bg-amber-100' : 'bg-emerald-100'
          } rounded-xl p-2.5 shrink-0`}
        >
          <Icon
            size={18}
            className={isWarning ? 'text-amber-600' : 'text-emerald-600'}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`font-semibold text-sm ${
              isWarning ? 'text-amber-800' : 'text-emerald-800'
            }`}
          >
            {insight.title}
          </p>
          <p
            className={`text-xs mt-0.5 ${
              isWarning ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {insight.subtitle}
          </p>
        </div>
        <ArrowRight
          size={16}
          className={`shrink-0 mt-1 ${
            isWarning ? 'text-amber-400' : 'text-emerald-400'
          }`}
        />
      </motion.div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function HomePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<QuickStats>({
    documentsCount: null,
    monthlyBalance: null,
    promosCount: null,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);

  // Fetch quick stats and build insights when authenticated
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setStatsLoading(false);
      setInsightsLoading(false);
      setInsights([
        {
          type: 'tip',
          title: 'Connecte-toi pour voir tes insights',
          subtitle: 'Alertes documents, promos et plus encore',
          icon: Shield,
          href: '/auth/login',
        },
      ]);
      return;
    }

    const now = new Date();
    const monthParam = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const fetchStats = async () => {
      const results = await Promise.allSettled([
        api.get('/documents'),
        api.get(`/transactions/summary?month=${monthParam}`),
        api.get('/products/promotions'),
      ]);

      const docs =
        results[0].status === 'fulfilled'
          ? (results[0].value.data?.data ?? results[0].value.data ?? [])
          : [];
      const summary =
        results[1].status === 'fulfilled'
          ? (results[1].value.data?.data ?? results[1].value.data ?? {})
          : {};
      const promos =
        results[2].status === 'fulfilled'
          ? (results[2].value.data?.data ?? results[2].value.data ?? [])
          : [];

      const docsArray: DocumentItem[] = Array.isArray(docs) ? docs : [];
      const promosArray: PromoItem[] = Array.isArray(promos) ? promos : [];

      setStats({
        documentsCount: docsArray.length,
        monthlyBalance:
          typeof summary.balance === 'number'
            ? summary.balance
            : typeof summary.total === 'number'
            ? summary.total
            : null,
        promosCount: promosArray.length,
      });
      setStatsLoading(false);

      // Build insights from real data
      const builtInsights: InsightCard[] = [];

      // Check for expiring documents (within 60 days)
      const soon = new Date();
      soon.setDate(soon.getDate() + 60);
      docsArray.forEach((doc) => {
        if (doc.expiry_date) {
          const exp = new Date(doc.expiry_date);
          if (exp <= soon && exp >= new Date()) {
            builtInsights.push({
              type: 'warning',
              title: `${doc.title || doc.type} expire bientot`,
              subtitle: `Date d'expiration: ${exp.toLocaleDateString('fr-MA')}`,
              icon: Clock,
              href: '/documents',
            });
          }
        }
      });

      // Add promo insights
      promosArray.slice(0, 2).forEach((promo) => {
        builtInsights.push({
          type: 'saving',
          title: promo.name || promo.title || 'Promo disponible',
          subtitle: promo.discount_percent
            ? `Economisez ${promo.discount_percent}%${promo.store ? ` chez ${promo.store}` : ''}`
            : promo.store
            ? `Disponible chez ${promo.store}`
            : 'Consultez les details',
          icon: Tag,
          href: '/prices',
        });
      });

      // Fallback insights if none found
      if (builtInsights.length === 0) {
        builtInsights.push(
          {
            type: 'saving',
            title: 'Explorez les promos de la semaine',
            subtitle: 'Comparez les prix entre BIM, Marjane et plus',
            icon: Tag,
            href: '/prices',
          },
          {
            type: 'warning',
            title: 'Verifiez vos documents',
            subtitle: 'Assurez-vous que rien n\'expire bientot',
            icon: AlertTriangle,
            href: '/documents',
          }
        );
      }

      setInsights(builtInsights.slice(0, 3));
      setInsightsLoading(false);
    };

    fetchStats();
  }, [isAuthenticated, authLoading]);

  // Current hour for greeting
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Sbah lkhir' : hour < 18 ? 'Msa lkhir' : 'Msa lkhir';

  return (
    <div className="min-h-screen bg-gray-50/50 pb-28">
      {/* ================================================================= */}
      {/* HERO SECTION                                                      */}
      {/* ================================================================= */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 px-5 pt-12 pb-14 overflow-hidden"
      >
        <FloatingShapes />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
          >
            <p className="text-emerald-100 text-sm font-medium mb-1">
              {timeGreeting} 🌟
            </p>
            <h1 className="text-[28px] font-extrabold text-white leading-tight">
              Salam, {user?.name?.split(' ')[0] || 'Bienvenue'} 👋
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="text-emerald-50 text-lg mt-2 font-arabic"
            dir="rtl"
          >
            حياتك أسهل ✨
          </motion.p>

          {!isAuthenticated && !authLoading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <Link href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-4 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors border border-white/20"
                >
                  <LogIn size={16} />
                  Se connecter
                </motion.button>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* QUICK STATS ROW                                                   */}
      {/* ================================================================= */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="flex gap-3 px-5 -mt-7 relative z-10"
      >
        <StatCard
          label="Documents"
          value={
            isAuthenticated
              ? stats.documentsCount !== null
                ? `${stats.documentsCount} doc${stats.documentsCount !== 1 ? 's' : ''}`
                : '--'
              : '...'
          }
          icon={FileText}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          loading={isAuthenticated && statsLoading}
        />
        <StatCard
          label="Ce mois"
          value={
            isAuthenticated
              ? stats.monthlyBalance !== null
                ? formatMAD(stats.monthlyBalance)
                : '--'
              : '...'
          }
          icon={TrendingUp}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          loading={isAuthenticated && statsLoading}
        />
        <StatCard
          label="Promos"
          value={
            isAuthenticated
              ? stats.promosCount !== null
                ? `${stats.promosCount} actif${stats.promosCount !== 1 ? 's' : ''}`
                : '--'
              : '...'
          }
          icon={Tag}
          color="bg-gradient-to-br from-pink-500 to-pink-600"
          loading={isAuthenticated && statsLoading}
        />
      </motion.section>

      {/* ================================================================= */}
      {/* MODULE CARDS GRID                                                 */}
      {/* ================================================================= */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="px-5 mt-8"
      >
        <motion.h2
          variants={fadeUp}
          className="text-lg font-bold text-gray-900 mb-4"
        >
          Services
        </motion.h2>
        <div className="grid grid-cols-2 gap-3">
          {modules.map((mod) => (
            <ModuleCardPremium key={mod.href} {...mod} />
          ))}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* AI INSIGHTS SECTION                                               */}
      {/* ================================================================= */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="px-5 mt-10"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-emerald-500" />
          <h2 className="text-lg font-bold text-gray-900">Insights IA</h2>
          <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
            Smart
          </span>
        </motion.div>

        {insightsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="insights-list"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {insights.map((insight, idx) => (
                <InsightCardComponent key={idx} insight={insight} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.section>

      {/* ================================================================= */}
      {/* FLOATING AI CHAT BUTTON                                           */}
      {/* ================================================================= */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-24 right-5 z-50"
      >
        <Link href="/chat">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            className="relative w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white"
          >
            {/* Pulse ring */}
            <motion.span
              className="absolute inset-0 rounded-full bg-emerald-400/40"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Bot size={24} className="relative z-10" />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
