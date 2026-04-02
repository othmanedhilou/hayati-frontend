'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, Trophy, Tag, ArrowLeft, ShoppingBasket } from 'lucide-react';
import Link from 'next/link';

interface Category { id: number; name: string; name_ar: string; }
interface Product { id: number; name: string; name_ar: string; brand: string; unit: string; }
interface Price { product_id: number; store_id: number; price: number; old_price: number | null; store: { id: number; name: string }; }
interface Promo { id: number; discount_percent: number; promo_price: number; product: { name: string; brand: string }; store: { name: string }; start_date: string; end_date: string; }

export default function PricesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products/categories'),
      api.get('/products/promotions'),
    ]).then(([catRes, promoRes]) => {
      setCategories(catRes.data.categories || catRes.data);
      setPromos(promoRes.data.promotions || promoRes.data);
      setLoading(false);
    });
  }, []);

  const loadProducts = async (cat: Category) => {
    setSelectedCat(cat);
    setSelectedProduct(null);
    setLoading(true);
    try {
      const res = await api.get(`/products/category/${cat.id}`);
      setProducts(res.data.products || res.data);
    } catch {} finally { setLoading(false); }
  };

  const loadPrices = async (product: Product) => {
    setSelectedProduct(product);
    setLoading(true);
    try {
      const res = await api.get(`/products/compare/${product.id}`);
      setPrices(res.data.prices || res.data);
    } catch {} finally { setLoading(false); }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await api.get(`/products/search?q=${q}`);
      setSearchResults(res.data.products || res.data);
    } catch {}
  };

  const goBack = () => {
    if (selectedProduct) { setSelectedProduct(null); setPrices([]); }
    else if (selectedCat) { setSelectedCat(null); setProducts([]); }
  };

  const cheapestPrice = prices.length > 0 ? Math.min(...prices.map(p => parseFloat(String(p.price)))) : 0;
  const mostExpensive = prices.length > 0 ? Math.max(...prices.map(p => parseFloat(String(p.price)))) : 0;
  const savings = mostExpensive - cheapestPrice;

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        {(selectedCat || selectedProduct) ? (
          <button onClick={goBack} className="p-2 bg-white rounded-xl shadow-sm"><ChevronLeft size={20} /></button>
        ) : (
          <Link href="/" className="p-2 bg-white rounded-xl shadow-sm"><ChevronLeft size={20} /></Link>
        )}
        <h1 className="text-xl font-bold">{selectedProduct ? selectedProduct.name : selectedCat ? selectedCat.name : 'Comparer les Prix'} 🛒</h1>
      </div>

      {/* Search */}
      {!selectedProduct && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input type="text" placeholder="Rechercher un produit..." value={searchQuery} onChange={e => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500" />
          {searchResults.length > 0 && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 bg-white rounded-xl shadow-lg border mt-1 z-20 max-h-48 overflow-y-auto">
              {searchResults.map(p => (
                <button key={p.id} onClick={() => { loadPrices(p); setSearchQuery(''); setSearchResults([]); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0">
                  {p.name} <span className="text-gray-400">- {p.brand}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Price Comparison View */}
        {selectedProduct && (
          <motion.div key="prices" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
            ) : (
              <>
                {savings > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 text-center">
                    <p className="text-emerald-700 font-bold text-lg">Tu économises {savings.toFixed(2)} DH! 💰</p>
                    <p className="text-emerald-600 text-xs">En choisissant le magasin le moins cher</p>
                  </div>
                )}
                <div className="space-y-2">
                  {prices.map((p, i) => {
                    const price = parseFloat(String(p.price));
                    const isCheapest = price === cheapestPrice;
                    return (
                      <motion.div key={p.store_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className={`bg-white rounded-2xl shadow-sm border p-4 flex items-center justify-between ${isCheapest ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isCheapest ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {p.store?.name?.charAt(0)}
                          </div>
                          <span className="font-semibold text-sm">{p.store?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isCheapest ? 'text-emerald-600 text-lg' : 'text-gray-700'}`}>{price.toFixed(2)} DH</span>
                          {isCheapest && <Trophy size={18} className="text-amber-500" />}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Products List */}
        {selectedCat && !selectedProduct && (
          <motion.div key="products" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
            ) : (
              <div className="space-y-2">
                {products.map((p, i) => (
                  <motion.button key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => loadPrices(p)}
                    className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 text-left hover:shadow-md transition">
                    <div className="bg-pink-50 p-2.5 rounded-xl"><ShoppingBasket size={18} className="text-pink-500" /></div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{p.name}</h3>
                      <p className="text-xs text-gray-400">{p.brand} • {p.unit}</p>
                    </div>
                    <ChevronLeft size={16} className="text-gray-300 rotate-180" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Categories */}
        {!selectedCat && !selectedProduct && (
          <motion.div key="cats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {categories.map((cat, i) => (
                <motion.button key={cat.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  onClick={() => loadProducts(cat)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition">
                  <h3 className="font-semibold text-xs">{cat.name}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">{cat.name_ar}</p>
                </motion.button>
              ))}
            </div>

            {/* Promos */}
            {promos.length > 0 && (
              <div>
                <h2 className="font-bold text-sm mb-3 text-gray-700 flex items-center gap-2"><Tag size={16} className="text-red-500" /> Promotions du moment</h2>
                <div className="space-y-2">
                  {promos.map((promo, i) => (
                    <motion.div key={promo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm">{promo.product?.name}</h3>
                          <p className="text-xs text-gray-500">{promo.store?.name}</p>
                        </div>
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">-{promo.discount_percent}%</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-emerald-600">{parseFloat(String(promo.promo_price)).toFixed(2)} DH</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
