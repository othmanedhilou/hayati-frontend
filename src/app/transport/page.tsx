'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { ChevronLeft, Car, Train, Bus, TramFront, Users, Trophy, Zap, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  taxi: { icon: Car, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  train: { icon: Train, color: 'text-blue-600', bg: 'bg-blue-50' },
  bus: { icon: Bus, color: 'text-green-600', bg: 'bg-green-50' },
  tram: { icon: TramFront, color: 'text-purple-600', bg: 'bg-purple-50' },
  covoiturage: { icon: Users, color: 'text-pink-600', bg: 'bg-pink-50' },
};

interface TransportOption { id: number; type: string; price_min: number; price_max: number; duration_minutes: number; provider_name: string; notes: string; }
interface Route { id: number; origin: string; destination: string; distance_km: number; options: TransportOption[]; }

export default function TransportPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [results, setResults] = useState<Route | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger'];

  useEffect(() => {
    api.get('/transport').then(res => setRoutes(res.data.routes || res.data));
  }, []);

  const handleSearch = async () => {
    if (!origin || !destination) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/transport/search?origin=${origin}&destination=${destination}`);
      const data = res.data.routes || res.data;
      setResults(Array.isArray(data) && data.length > 0 ? data[0] : null);
    } catch { setResults(null); }
    finally { setLoading(false); }
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
    } catch {} finally { setLoading(false); }
  };

  const cheapest = results?.options?.reduce((a, b) => a.price_min < b.price_min ? a : b, results.options[0]);
  const fastest = results?.options?.reduce((a, b) => a.duration_minutes < b.duration_minutes ? a : b, results.options[0]);

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 bg-white rounded-xl shadow-sm"><ChevronLeft size={20} /></Link>
        <h1 className="text-xl font-bold">Transport 🚕</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="space-y-3">
          <select value={origin} onChange={e => setOrigin(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 text-sm">
            <option value="">De: Ville de départ</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={destination} onChange={e => setDestination(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 text-sm">
            <option value="">À: Ville d&apos;arrivée</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSearch}
            className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600 transition">
            <Search size={18} /> Rechercher
          </motion.button>
        </div>
      </div>

      {loading && <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>}

      {!loading && results && results.options && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm">{results.origin} → {results.destination}</h2>
            <span className="text-xs text-gray-400">{results.distance_km} km</span>
          </div>
          <div className="space-y-3">
            {results.options.map((opt, i) => {
              const config = typeConfig[opt.type] || typeConfig.taxi;
              const Icon = config.icon;
              const isCheapest = opt.id === cheapest?.id;
              const isFastest = opt.id === fastest?.id;
              return (
                <motion.div key={opt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className={`bg-white rounded-2xl shadow-sm border p-4 ${isCheapest ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-gray-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${config.bg}`}><Icon size={22} className={config.color} /></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm capitalize">{opt.type}</h3>
                        {isCheapest && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5"><Trophy size={10} /> Meilleur prix</span>}
                        {isFastest && !isCheapest && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5"><Zap size={10} /> Plus rapide</span>}
                      </div>
                      {opt.provider_name && <p className="text-xs text-gray-400">{opt.provider_name}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{opt.price_min}-{opt.price_max} DH</p>
                      <p className="text-xs text-gray-400">{opt.duration_minutes < 60 ? `${opt.duration_minutes} min` : `${Math.floor(opt.duration_minutes / 60)}h${opt.duration_minutes % 60 > 0 ? (opt.duration_minutes % 60).toString().padStart(2, '0') : ''}`}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {!loading && searched && !results && (
        <p className="text-center text-gray-400 py-8">Aucun trajet trouvé pour cette route</p>
      )}

      {!searched && !loading && routes.length > 0 && (
        <div>
          <h2 className="font-bold text-sm mb-3 text-gray-700">Trajets populaires</h2>
          <div className="space-y-2">
            {routes.map((r) => (
              <motion.button key={r.id} whileTap={{ scale: 0.98 }} onClick={() => loadRoute(r.id)}
                className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{r.origin}</span>
                  <ArrowRight size={14} className="text-gray-400" />
                  <span className="text-sm font-medium">{r.destination}</span>
                </div>
                <span className="text-xs text-gray-400">{r.distance_km} km</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
