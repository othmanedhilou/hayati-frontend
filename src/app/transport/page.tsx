'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Car, Train, Bus, TramFront, Users, Trophy, Zap,
  Search, ArrowRight, MapPin, Route, Compass, ArrowUpDown, Clock,
  Banknote, Sparkles, Info, ChevronDown, Navigation, Gauge,
  Star, Shield, Leaf,
} from 'lucide-react';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const typeConfig: Record<string, {
  icon: typeof Train; color: string; bg: string; border: string;
  gradient: string; label: string; emoji: string;
}> = {
  train: {
    icon: Train, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200',
    gradient: 'from-blue-500 to-blue-600', label: 'Train', emoji: '🚄',
  },
  bus: {
    icon: Bus, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200',
    gradient: 'from-emerald-500 to-emerald-600', label: 'Bus', emoji: '🚌',
  },
  taxi: {
    icon: Car, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200',
    gradient: 'from-amber-500 to-amber-600', label: 'Grand Taxi', emoji: '🚕',
  },
  tram: {
    icon: TramFront, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200',
    gradient: 'from-purple-500 to-purple-600', label: 'Tram', emoji: '🚋',
  },
  covoiturage: {
    icon: Users, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200',
    gradient: 'from-pink-500 to-pink-600', label: 'Covoiturage', emoji: '🤝',
  },
};

interface TransportOption {
  id: number; type: string; price_min: string | number; price_max: string | number;
  duration_minutes: number; provider_name: string; notes: string | null;
}
interface Route_ {
  id: number; origin: string; destination: string; distance_km: number; options: TransportOption[];
}

type SortMode = 'smart' | 'price' | 'duration';

const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tanger', 'Agadir', 'Oujda', 'Meknes'];

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseNum(v: string | number): number {
  return typeof v === 'string' ? parseFloat(v) : v;
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
}

function smartScore(opt: TransportOption, allOpts: TransportOption[]): number {
  const prices = allOpts.map(o => parseNum(o.price_min));
  const durations = allOpts.map(o => o.duration_minutes);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDur = Math.min(...durations);
  const maxDur = Math.max(...durations);

  const priceRange = maxPrice - minPrice || 1;
  const durRange = maxDur - minDur || 1;

  const priceScore = 1 - (parseNum(opt.price_min) - minPrice) / priceRange;
  const durScore = 1 - (opt.duration_minutes - minDur) / durRange;

  // 50% price, 40% duration, 10% comfort bonus (train/tram get boost)
  const comfortBonus = ['train', 'tram'].includes(opt.type) ? 0.1 : 0;
  return priceScore * 0.5 + durScore * 0.4 + comfortBonus;
}

function getRecommendationTag(opt: TransportOption, allOpts: TransportOption[]): {
  label: string; icon: typeof Trophy; colors: string;
} | null {
  if (allOpts.length <= 1) return null;
  const prices = allOpts.map(o => parseNum(o.price_min));
  const durations = allOpts.map(o => o.duration_minutes);
  const minPrice = Math.min(...prices);
  const minDur = Math.min(...durations);

  const score = smartScore(opt, allOpts);
  const bestScore = Math.max(...allOpts.map(o => smartScore(o, allOpts)));

  if (score === bestScore) return { label: 'Recommande IA', icon: Sparkles, colors: 'from-emerald-500 to-teal-500' };
  if (parseNum(opt.price_min) === minPrice) return { label: 'Moins cher', icon: Banknote, colors: 'from-green-500 to-emerald-500' };
  if (opt.duration_minutes === minDur) return { label: 'Plus rapide', icon: Zap, colors: 'from-purple-500 to-pink-500' };
  return null;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function CitySelector({ value, onChange, label, icon: Icon, exclude, accentColor }: {
  value: string; onChange: (c: string) => void; label: string;
  icon: typeof MapPin; exclude?: string; accentColor: string;
}) {
  const [open, setOpen] = useState(false);
  const filtered = exclude ? cities.filter(c => c !== exclude) : cities;

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl border backdrop-blur-xl transition-all ${
          value
            ? `bg-white border-${accentColor}-200 shadow-sm`
            : 'bg-white/70 border-gray-200 text-gray-400'
        }`}
      >
        <div className={`p-2 rounded-xl ${value ? `bg-${accentColor}-50` : 'bg-gray-100'}`}>
          <Icon size={16} className={value ? `text-${accentColor}-500` : 'text-gray-400'} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</p>
          <p className={`text-sm font-bold ${value ? 'text-gray-900' : 'text-gray-400'}`}>
            {value || 'Choisir une ville'}
          </p>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </motion.button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-20" onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute z-30 top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-gray-200 p-2 shadow-2xl"
            >
              <div className="grid grid-cols-2 gap-1.5">
                {filtered.map(c => (
                  <motion.button
                    key={c} whileTap={{ scale: 0.95 }}
                    onClick={() => { onChange(c); setOpen(false); }}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      value === c
                        ? `bg-purple-500 text-white shadow-lg shadow-purple-500/30`
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {c}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function OptionCard({ opt, allOpts, index }: {
  opt: TransportOption; allOpts: TransportOption[]; index: number;
}) {
  const config = typeConfig[opt.type] || typeConfig.taxi;
  const Icon = config.icon;
  const tag = getRecommendationTag(opt, allOpts);
  const isRecommended = tag?.label === 'Recommande IA';
  const priceMin = parseNum(opt.price_min);
  const priceMax = parseNum(opt.price_max);

  return (
    <motion.div
      variants={fadeUp}
      className={`relative rounded-2xl border overflow-hidden transition-all ${
        isRecommended
          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-lg shadow-emerald-100/60 ring-1 ring-emerald-200/50'
          : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
      }`}
    >
      {/* Tag */}
      {tag && (
        <div className={`flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r ${tag.colors} text-white`}>
          <tag.icon size={12} />
          <span className="text-[11px] font-bold tracking-wide">{tag.label}</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Transport icon */}
          <div className={`w-14 h-14 rounded-2xl ${config.bg} ${config.border} border flex flex-col items-center justify-center`}>
            <Icon size={22} className={config.color} />
            <span className="text-[9px] font-bold mt-0.5 text-gray-500">{config.label}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[15px] text-gray-900">{opt.provider_name}</h3>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                {formatDuration(opt.duration_minutes)}
              </span>
              {opt.notes && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Info size={11} />
                  {opt.notes}
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="text-right shrink-0">
            <p className="font-black text-lg text-gray-900">
              {Math.round(priceMin)}
              <span className="text-xs font-medium text-gray-400"> DH</span>
            </p>
            {priceMin !== priceMax && (
              <p className="text-[11px] text-gray-400">
                max {Math.round(priceMax)} DH
              </p>
            )}
          </div>
        </div>

        {/* Bottom features row */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100/80">
          {opt.type === 'train' && (
            <>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                <Shield size={10} /> Confortable
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <Leaf size={10} /> Ecologique
              </span>
            </>
          )}
          {opt.type === 'bus' && (
            <>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                <Banknote size={10} /> Economique
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                <Shield size={10} /> Climatise
              </span>
            </>
          )}
          {opt.type === 'taxi' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
              <Zap size={10} /> Porte-a-porte
            </span>
          )}
          {opt.type === 'covoiturage' && (
            <>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-pink-600 bg-pink-50 px-2 py-1 rounded-lg">
                <Users size={10} /> Social
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <Leaf size={10} /> Ecologique
              </span>
            </>
          )}
          {opt.type === 'tram' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
              <Navigation size={10} /> Urbain
            </span>
          )}
          <div className="flex-1" />
          <span className="text-[10px] font-semibold text-gray-400">
            ~{(parseNum(opt.price_min) / Math.max(opt.duration_minutes, 1) * 60).toFixed(0)} DH/h
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function TransportPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [results, setResults] = useState<Route_ | null>(null);
  const [routes, setRoutes] = useState<Route_[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('smart');

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

  const loadRoute = async (r: Route_) => {
    setOrigin(r.origin);
    setDestination(r.destination);
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/transport/${r.id}`);
      const data = res.data.route || res.data;
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const swapCities = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const sortedOptions = useMemo(() => {
    if (!results?.options) return [];
    const opts = [...results.options];
    if (sortMode === 'price') return opts.sort((a, b) => parseNum(a.price_min) - parseNum(b.price_min));
    if (sortMode === 'duration') return opts.sort((a, b) => a.duration_minutes - b.duration_minutes);
    // smart: score descending
    return opts.sort((a, b) => smartScore(b, opts) - smartScore(a, opts));
  }, [results, sortMode]);

  const cheapest = results?.options?.length
    ? Math.min(...results.options.map(o => parseNum(o.price_min)))
    : 0;
  const fastest = results?.options?.length
    ? Math.min(...results.options.map(o => o.duration_minutes))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ============ HEADER ============ */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.4),transparent_60%)]" />
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-12 left-0 w-20 h-20 bg-white/5 rounded-full translate-x-[-50%]" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent" />

        <div className="relative px-5 pt-14 pb-6">
          <div className="flex items-center gap-3 mb-5">
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="p-2.5 bg-white/15 backdrop-blur-sm rounded-2xl text-white"
              >
                <ChevronLeft size={20} />
              </motion.div>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Transport</h1>
              <p className="text-purple-200 text-sm mt-0.5 flex items-center gap-1.5">
                <Sparkles size={12} />
                Comparaison intelligente
              </p>
            </div>
            <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-2xl">
              <Gauge size={20} className="text-white" />
            </div>
          </div>

          {/* ============ CITY SELECTORS ============ */}
          <div className="relative space-y-2">
            <CitySelector
              value={origin} onChange={setOrigin}
              label="Depart" icon={MapPin} exclude={destination}
              accentColor="purple"
            />

            {/* Swap button */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={swapCities}
                disabled={!origin && !destination}
                className="w-10 h-10 bg-white rounded-full shadow-lg shadow-purple-500/20 flex items-center justify-center border-2 border-purple-100 disabled:opacity-40"
              >
                <ArrowUpDown size={16} className="text-purple-500" />
              </motion.button>
            </div>

            <CitySelector
              value={destination} onChange={setDestination}
              label="Arrivee" icon={Navigation} exclude={origin}
              accentColor="indigo"
            />
          </div>

          {/* Search button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSearch}
            disabled={!origin || !destination || loading}
            className="w-full mt-4 py-4 bg-white text-purple-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-white/20 disabled:opacity-40 transition-all"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full" />
            ) : (
              <>
                <Search size={18} />
                Comparer les options
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* ============ CONTENT ============ */}
      <div className="px-5 mt-2">
        {/* Loading */}
        {loading && (
          <div className="space-y-3 mt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-2xl bg-white animate-pulse" />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ============ RESULTS ============ */}
          {!loading && results && sortedOptions.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              {/* Route header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-900">{results.origin}</span>
                    <ArrowRight size={16} className="text-purple-400" />
                    <span className="font-bold text-lg text-gray-900">{results.destination}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {results.distance_km} km &middot; {sortedOptions.length} options disponibles
                  </p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
                  <Banknote size={16} className="text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Des</p>
                  <p className="font-black text-emerald-600 text-sm">{Math.round(cheapest)} DH</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
                  <Zap size={16} className="text-purple-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Des</p>
                  <p className="font-black text-purple-600 text-sm">{formatDuration(fastest)}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
                  <Route size={16} className="text-blue-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Distance</p>
                  <p className="font-black text-blue-600 text-sm">{results.distance_km} km</p>
                </div>
              </div>

              {/* Sort tabs */}
              <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl mb-4">
                {([
                  { key: 'smart' as SortMode, label: 'Intelligent', icon: Sparkles },
                  { key: 'price' as SortMode, label: 'Prix', icon: Banknote },
                  { key: 'duration' as SortMode, label: 'Duree', icon: Clock },
                ]).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setSortMode(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      sortMode === tab.key
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon size={13} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Option cards */}
              <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
                {sortedOptions.map((opt, i) => (
                  <OptionCard key={opt.id} opt={opt} allOpts={results.options} index={i} />
                ))}
              </motion.div>

              {/* AI tip */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/60 rounded-2xl p-4 flex items-start gap-3"
              >
                <div className="p-2 bg-purple-100 rounded-xl shrink-0">
                  <Sparkles size={16} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-800">Conseil HAYATI</p>
                  <p className="text-xs text-purple-600 mt-0.5 leading-relaxed">
                    {sortedOptions[0]?.type === 'train'
                      ? `Le train ${sortedOptions[0].provider_name} offre le meilleur rapport qualite-prix pour ce trajet. Reservez a l'avance sur oncf.ma pour les meilleurs tarifs.`
                      : sortedOptions[0]?.type === 'bus'
                      ? `Le bus ${sortedOptions[0].provider_name} est l'option la plus economique. Achetez votre billet en ligne pour eviter les files d'attente.`
                      : sortedOptions[0]?.type === 'covoiturage'
                      ? `Le covoiturage est ideal pour ce trajet ! Flexible et economique, c'est aussi plus ecologique.`
                      : `Pour ${results.distance_km}km, comparez bien les options. Le prix peut varier selon l'heure de depart.`
                    }
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Empty state */}
          {!loading && searched && (!results || !results.options || results.options.length === 0) && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="w-24 h-24 bg-purple-50 rounded-3xl flex items-center justify-center mb-6 border border-purple-200">
                <Route size={40} className="text-purple-400" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Aucun trajet trouve</h3>
              <p className="text-sm text-gray-500 text-center max-w-[250px]">
                Essayez une autre combinaison de villes. Nous ajoutons de nouvelles routes regulierement.
              </p>
            </motion.div>
          )}

          {/* ============ POPULAR ROUTES ============ */}
          {!searched && !loading && routes.length > 0 && (
            <motion.div
              key="popular"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Star size={16} className="text-purple-500" />
                <h2 className="font-bold text-sm text-gray-700">Trajets populaires</h2>
              </div>

              <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2.5">
                {routes.map((r) => {
                  const cheapOpt = r.options?.length
                    ? r.options.reduce((a, b) => parseNum(a.price_min) < parseNum(b.price_min) ? a : b)
                    : null;
                  const fastOpt = r.options?.length
                    ? r.options.reduce((a, b) => a.duration_minutes < b.duration_minutes ? a : b)
                    : null;

                  return (
                    <motion.button
                      key={r.id}
                      variants={fadeUp}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => loadRoute(r)}
                      className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left hover:shadow-md hover:border-purple-200 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl flex items-center justify-center border border-purple-100 group-hover:from-purple-100 group-hover:to-indigo-100 transition-colors">
                          <Route size={20} className="text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">{r.origin}</span>
                            <ArrowRight size={14} className="text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                            <span className="font-bold text-sm text-gray-900">{r.destination}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-400">{r.distance_km} km</span>
                            {r.options && (
                              <span className="text-xs text-gray-400">{r.options.length} options</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {cheapOpt && (
                            <p className="text-sm font-bold text-emerald-600">
                              des {Math.round(parseNum(cheapOpt.price_min))} DH
                            </p>
                          )}
                          {fastOpt && (
                            <p className="text-[11px] text-gray-400">
                              {formatDuration(fastOpt.duration_minutes)} min
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Transport type pills */}
                      {r.options && (
                        <div className="flex gap-1.5 mt-3 pt-3 border-t border-gray-50">
                          {[...new Set(r.options.map(o => o.type))].map(type => {
                            const cfg = typeConfig[type] || typeConfig.taxi;
                            return (
                              <span key={type} className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.color}`}>
                                {cfg.emoji} {cfg.label}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
