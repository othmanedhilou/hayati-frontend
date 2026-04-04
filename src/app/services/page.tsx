'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Star, MapPin, Phone, BadgeCheck, Search,
  Wrench, Zap, Settings, Paintbrush, Hammer, Home, Key, Thermometer,
  SearchX,
} from 'lucide-react';
import Link from 'next/link';

const iconMap: Record<string, any> = {
  wrench: Wrench, zap: Zap, settings: Settings, paintbrush: Paintbrush,
  hammer: Hammer, home: Home, key: Key, thermometer: Thermometer,
};

const catColors = [
  { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/20' },
  { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/20' },
  { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/20' },
  { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/20' },
  { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/20' },
  { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/20' },
  { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/20' },
];

interface Category { id: number; name: string; name_ar: string; icon: string; slug: string; }
interface Provider {
  id: number; name: string; phone: string; description: string; city: string;
  avg_rating: number | string; total_reviews: number; price_min: number | string; price_max: number | string;
  verified: boolean; available: boolean;
}

const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tanger', 'Agadir'];

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [cityOpen, setCityOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/services/categories')
      .then(res => {
        setCategories(res.data.categories || res.data || []);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading categories:', err);
        setCategories([]);
        setError('Impossible de charger les catégories. Veuillez réessayer.');
        setLoading(false);
      });
  }, []);

  const loadProviders = async (cat: Category) => {
    setSelectedCat(cat);
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (city) params.set('city', city);
      params.set('sort', 'avg_rating');
      params.set('dir', 'desc');
      const res = await api.get(`/services/providers/${cat.id}?${params}`);
      setProviders(res.data.providers || res.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error loading providers:', err?.response?.status, err?.message);
      setProviders([]);
      setError(err?.response?.status === 401 
        ? 'Connecte-toi d\'abord pour voir les prestataires' 
        : 'Erreur lors du chargement des prestataires');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCat) loadProviders(selectedCat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, city]);

  const goBack = () => {
    setSelectedCat(null);
    setProviders([]);
    setSearch('');
    setCity('');
    setCityOpen(false);
  };

  const renderStars = (rating: number | string) => {
    const r = typeof rating === 'string' ? parseFloat(rating) : (rating || 0);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={13}
        className={i < Math.round(r) ? 'text-amber-400 fill-amber-400' : 'text-gray-600/50'}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8">
      {/* Header */}
      <div className="relative overflow-hidden lg:rounded-2xl lg:mx-0 lg:mt-2">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-amber-600 to-red-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,146,60,0.4),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent" />

        <div className="relative px-5 pt-14 lg:pt-8 pb-8">
          <div className="flex items-center gap-3">
            {selectedCat ? (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={goBack}
                className="p-2.5 bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-200"
              >
                <ChevronLeft size={20} className="text-gray-900" />
              </motion.button>
            ) : (
              <Link href="/">
                <motion.div
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="p-2.5 bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-200"
                >
                  <ChevronLeft size={20} className="text-gray-900" />
                </motion.div>
              </Link>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {selectedCat ? selectedCat.name : 'Services'}
              </h1>
              <p className="text-orange-200 text-sm mt-0.5">
                {selectedCat ? selectedCat.name_ar : 'Trouvez les meilleurs prestataires'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 mt-2">
        <AnimatePresence mode="wait">
          {/* Error Banner */}
          {error && !selectedCat && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-red-500/15 border border-red-500/30 rounded-2xl"
            >
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}
          {/* Categories Grid */}
          {!selectedCat ? (
            <motion.div
              key="cats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {loading ? (
                <div className="grid grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="aspect-square rounded-2xl bg-white/80 animate-pulse" />
                  ))}
                </div>
              ) : (
                <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
                  {categories.map((cat, i) => {
                    const Icon = iconMap[cat.icon] || Wrench;
                    const colorSet = catColors[i % catColors.length];
                    return (
                      <motion.button
                        key={cat.id}
                        variants={fadeUp}
                        whileHover={{ scale: 1.06, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => loadProviders(cat)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border backdrop-blur-xl bg-white/80 ${colorSet.border} hover:bg-white/8 transition-all aspect-square`}
                      >
                        <div className={`p-2.5 rounded-xl ${colorSet.bg} mb-2`}>
                          <Icon size={22} className={colorSet.text} />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-900 text-center leading-tight">{cat.name}</span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Providers View */
            <motion.div
              key="providers"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              {/* Error Banner for Providers */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 bg-red-500/15 border border-red-500/30 rounded-2xl"
                >
                  <p className="text-sm text-red-300">{error}</p>
                </motion.div>
              )}
              {/* Search + City Filter */}
              <div className="flex gap-2 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>
                <div className="relative">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCityOpen(!cityOpen)}
                    className={`h-full px-4 bg-white/80 backdrop-blur-xl rounded-2xl border text-sm font-medium transition-all whitespace-nowrap ${
                      city ? 'border-orange-500/40 text-orange-400' : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    <MapPin size={14} className="inline mr-1.5" />
                    {city || 'Ville'}
                  </motion.button>
                  <AnimatePresence>
                    {cityOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="absolute z-30 top-full mt-2 right-0 w-44 bg-white/95 backdrop-blur-2xl rounded-2xl border border-gray-200 p-2 shadow-2xl"
                      >
                        <button
                          onClick={() => { setCity(''); setCityOpen(false); }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                            !city ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500 hover:bg-white/80'
                          }`}
                        >
                          Toutes les villes
                        </button>
                        {cities.map(c => (
                          <button
                            key={c}
                            onClick={() => { setCity(c); setCityOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                              city === c ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500 hover:bg-white/80'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Loading */}
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 rounded-2xl bg-white/80 animate-pulse" />
                  ))}
                </div>
              ) : providers.length > 0 ? (
                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
                  {providers.map((p) => (
                    <motion.div
                      key={p.id}
                      variants={fadeUp}
                      className="relative p-4 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl hover:bg-white/8 transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-gray-900">{p.name}</h3>
                            {p.verified && (
                              <BadgeCheck size={16} className="text-emerald-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1.5">
                            {renderStars(p.avg_rating)}
                            <span className="text-xs text-gray-500 ml-1.5">
                              {parseFloat(String(p.avg_rating || 0)).toFixed(1)} ({p.total_reviews})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-sm text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                            {Math.round(Number(p.price_min))}-{Math.round(Number(p.price_max))} DH
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin size={13} className="text-gray-600" />
                          {p.city}
                        </span>
                        <motion.a
                          href={`tel:${p.phone}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl transition-all hover:bg-emerald-500/20"
                        >
                          <Phone size={13} />
                          Appeler
                        </motion.a>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                /* Empty State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16"
                >
                  <div className="w-24 h-24 bg-orange-500/10 rounded-3xl flex items-center justify-center mb-6 border border-orange-500/20">
                    <SearchX size={40} className="text-orange-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Aucun prestataire</h3>
                  <p className="text-sm text-gray-500 text-center max-w-[250px]">
                    Aucun prestataire disponible dans cette categorie. Essayez une autre ville.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
