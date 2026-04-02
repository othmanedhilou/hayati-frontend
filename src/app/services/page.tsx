'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Star, MapPin, Phone, BadgeCheck, Search, Wrench, Zap, Settings, Paintbrush, Hammer, Home, Key, Thermometer } from 'lucide-react';
import Link from 'next/link';

const iconMap: Record<string, any> = {
  wrench: Wrench, zap: Zap, settings: Settings, paintbrush: Paintbrush, hammer: Hammer, home: Home, key: Key, thermometer: Thermometer,
};

interface Category { id: number; name: string; name_ar: string; icon: string; slug: string; }
interface Provider {
  id: number; name: string; phone: string; description: string; city: string; avg_rating: number;
  total_reviews: number; price_min: number; price_max: number; verified: boolean; available: boolean;
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    api.get('/services/categories').then(res => {
      setCategories(res.data.categories || res.data);
      setLoading(false);
    });
  }, []);

  const loadProviders = async (cat: Category) => {
    setSelectedCat(cat);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (city) params.set('city', city);
      params.set('sort', 'avg_rating');
      params.set('dir', 'desc');
      const res = await api.get(`/services/providers/${cat.id}?${params}`);
      setProviders(res.data.providers || res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    if (selectedCat) loadProviders(selectedCat);
  }, [search, city]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={14} className={i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
    ));
  };

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        {selectedCat ? (
          <button onClick={() => { setSelectedCat(null); setProviders([]); setSearch(''); setCity(''); }} className="p-2 bg-white rounded-xl shadow-sm">
            <ChevronLeft size={20} />
          </button>
        ) : (
          <Link href="/" className="p-2 bg-white rounded-xl shadow-sm"><ChevronLeft size={20} /></Link>
        )}
        <h1 className="text-xl font-bold">{selectedCat ? selectedCat.name : 'Services'} 🛠️</h1>
      </div>

      <AnimatePresence mode="wait">
        {!selectedCat ? (
          <motion.div key="cats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-3">
            {categories.map((cat, i) => {
              const Icon = iconMap[cat.icon] || Wrench;
              return (
                <motion.button key={cat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => loadProviders(cat)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center hover:shadow-md transition"
                >
                  <div className="bg-orange-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Icon size={26} className="text-orange-500" />
                  </div>
                  <h3 className="font-semibold text-sm">{cat.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{cat.name_ar}</p>
                </motion.button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="providers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500" />
              </div>
              <select value={city} onChange={e => setCity(e.target.value)}
                className="px-3 py-3 bg-white rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500">
                <option value="">Toutes villes</option>
                {['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
            ) : (
              <div className="space-y-3">
                {providers.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm">{p.name}</h3>
                          {p.verified && <BadgeCheck size={16} className="text-blue-500" />}
                        </div>
                        <div className="flex items-center gap-1 mt-1">{renderStars(p.avg_rating)}
                          <span className="text-xs text-gray-500 ml-1">{p.avg_rating} ({p.total_reviews})</span>
                        </div>
                      </div>
                      <span className="text-emerald-600 font-bold text-sm">{p.price_min}-{p.price_max} DH</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={14} />{p.city}</span>
                      <a href={`tel:${p.phone}`} className="flex items-center gap-1 text-xs text-emerald-600 font-medium ml-auto bg-emerald-50 px-3 py-1.5 rounded-lg">
                        <Phone size={14} /> Appeler
                      </a>
                    </div>
                  </motion.div>
                ))}
                {providers.length === 0 && <p className="text-center text-gray-400 py-8">Aucun prestataire trouvé</p>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
