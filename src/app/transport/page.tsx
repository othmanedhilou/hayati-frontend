'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Car, Train, Bus, TramFront, Users, Trophy, Zap,
  Search, ArrowRight, MapPin, Route, Compass,
} from 'lucide-react';
import Link from 'next/link';

const typeConfig: Record<string, { icon: any; color: string; bg: string; border: string; glow: string }> = {
  train:       { icon: Train,     color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   glow: 'shadow-blue-500/10' },
  bus:         { icon: Bus,       color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10' },
  taxi:        { icon: Car,       color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  glow: 'shadow-amber-500/10' },
  tram:        { icon: TramFront, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', glow: 'shadow-purple-500/10' },
  covoiturage: { icon: Users,     color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/20',   glow: 'shadow-pink-500/10' },
};

interface TransportOption {
  id: number; type: string; price_min: number; price_max: number;
  duration_minutes: number; provider_name: string; notes: string;
}
interface Route_ {
  id: number; origin: string; destination: string; distance_km: number; options: TransportOption[];
}

const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tanger', 'Agadir', 'Oujda', 'Meknes'];

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function TransportPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [results, setResults] = useState<Route_ | null>(null);
  const [routes, setRoutes] = useState<Route_[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [originOpen, setOriginOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);

  useEffect(() => {
    api.get('/transport')
      .then(res => setRoutes(res.data.routes || res.data || []))
      .catch(() => setRoutes([]));
  }, []);

  const handleSearch = async () => {
    if (!origin || !destination) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(
        `/transport/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
      );
      const data = res.data.routes || res.data;
      setResults(Array.isArray(data) && data.length > 0 ? data[0] : data && !Array.isArray(data) ? data : null);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRoute = async (id: number) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/transport/${id}`);
      const data = res.data.route || res.data;
      setResults(data);
      setOrigin(data.origin);
      setDestination(data.destination);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const cheapest = results?.options?.length
    ? results.options.reduce((a, b) => (a.price_min < b.price_min ? a : b), results.options[0])
    : null;
  const fastest = results?.options?.length
    ? results.options.reduce((a, b) => (a.duration_minutes < b.duration_minutes ? a : b), results.options[0])
    : null;

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-8">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.4),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-950 to-transparent" />

        <div className="relative px-5 pt-14 pb-10">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="p-2.5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10"
              >
                <ChevronLeft size={20} className="text-white" />
              </motion.div>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Transport</h1>
              <p className="text-purple-200 text-sm mt-0.5">Comparez les meilleurs trajets</p>
            </div>
          </div>

          {/* City Selectors */}
          <div className="space-y-3">
            {/* Origin Pill */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => { setOriginOpen(!originOpen); setDestOpen(false); }}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-xl transition-all ${
                  origin
                    ? 'bg-white/15 border-white/20 text-white'
                    : 'bg-white/10 border-white/10 text-purple-200'
                }`}
              >
                <div className="p-1.5 bg-purple-400/20 rounded-lg">
                  <MapPin size={16} className="text-purple-300" />
                </div>
                <span className="text-sm font-medium">{origin || 'Ville de depart'}</span>
              </motion.button>
              <AnimatePresence>
                {originOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute z-30 top-full mt-2 left-0 right-0 bg-gray-900/95 backdrop-blur-2xl rounded-2xl border border-white/10 p-2 shadow-2xl"
                  >
                    <div className="flex flex-wrap gap-2">
                      {cities.map(c => (
                        <motion.button
                          key={c} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => { setOrigin(c); setOriginOpen(false); }}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            origin === c
                              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                              : 'bg-white/10 text-gray-300 hover:bg-white/15'
                          }`}
                        >
                          {c}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Destination Pill */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => { setDestOpen(!destOpen); setOriginOpen(false); }}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-xl transition-all ${
                  destination
                    ? 'bg-white/15 border-white/20 text-white'
                    : 'bg-white/10 border-white/10 text-purple-200'
                }`}
              >
                <div className="p-1.5 bg-indigo-400/20 rounded-lg">
                  <Compass size={16} className="text-indigo-300" />
                </div>
                <span className="text-sm font-medium">{destination || "Ville d'arrivee"}</span>
              </motion.button>
              <AnimatePresence>
                {destOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute z-30 top-full mt-2 left-0 right-0 bg-gray-900/95 backdrop-blur-2xl rounded-2xl border border-white/10 p-2 shadow-2xl"
                  >
                    <div className="flex flex-wrap gap-2">
                      {cities.filter(c => c !== origin).map(c => (
                        <motion.button
                          key={c} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => { setDestination(c); setDestOpen(false); }}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            destination === c
                              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                              : 'bg-white/10 text-gray-300 hover:bg-white/15'
                          }`}
                        >
                          {c}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(168,85,247,0.4)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setOriginOpen(false); setDestOpen(false); handleSearch(); }}
              disabled={!origin || !destination || loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-purple-500/25 disabled:opacity-40 disabled:shadow-none transition-all"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <>
                  <Search size={18} />
                  Rechercher
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 mt-2">
        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {!loading && results && results.options && results.options.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-bold text-lg">
                    {results.origin} <ArrowRight size={16} className="inline text-purple-400 mx-1" /> {results.destination}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">{results.distance_km} km &middot; {results.options.length} options</p>
                </div>
              </div>

              <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
                {results.options.map((opt) => {
                  const config = typeConfig[opt.type] || typeConfig.taxi;
                  const Icon = config.icon;
                  const isCheapest = opt.id === cheapest?.id;
                  const isFastest = opt.id === fastest?.id && opt.id !== cheapest?.id;

                  return (
                    <motion.div
                      key={opt.id}
                      variants={fadeUp}
                      className={`relative p-4 rounded-2xl border backdrop-blur-xl transition-all ${
                        isCheapest
                          ? 'bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/30 shadow-lg shadow-purple-500/10'
                          : 'bg-white/5 border-white/10 hover:bg-white/8'
                      }`}
                    >
                      {/* Badge */}
                      {(isCheapest || isFastest) && (
                        <div className="absolute -top-2.5 right-4">
                          {isCheapest ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-[10px] font-bold text-white shadow-lg shadow-amber-500/30">
                              <Trophy size={10} /> Meilleur prix
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-[10px] font-bold text-white shadow-lg shadow-purple-500/30">
                              <Zap size={10} /> Plus rapide
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${config.bg} ${config.border} border`}>
                          <Icon size={24} className={config.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm capitalize text-white">{opt.type}</h3>
                          {opt.provider_name && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">{opt.provider_name}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                            {opt.price_min}-{opt.price_max} DH
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatDuration(opt.duration_minutes)}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && searched && (!results || !results.options || results.options.length === 0) && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="w-24 h-24 bg-purple-500/10 rounded-3xl flex items-center justify-center mb-6 border border-purple-500/20">
                <Route size={40} className="text-purple-400" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Aucun trajet trouve</h3>
              <p className="text-sm text-gray-500 text-center max-w-[250px]">
                Aucune option de transport disponible pour cette route. Essayez une autre destination.
              </p>
            </motion.div>
          )}

          {/* Popular Routes */}
          {!searched && !loading && routes.length > 0 && (
            <motion.div
              key="popular"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-4">Trajets populaires</h2>
              <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-none">
                {routes.map((r, i) => (
                  <motion.button
                    key={r.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => loadRoute(r.id)}
                    className="shrink-0 w-56 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 text-left hover:bg-white/8 hover:border-purple-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-purple-500/15 rounded-lg">
                        <MapPin size={14} className="text-purple-400" />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{r.distance_km} km</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{r.origin}</span>
                      <ArrowRight size={14} className="text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                      <span className="text-sm font-semibold text-white">{r.destination}</span>
                    </div>
                    {r.options && (
                      <p className="text-xs text-gray-500 mt-2">{r.options.length} options disponibles</p>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
