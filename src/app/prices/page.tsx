'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Search,
  Trophy,
  Tag,
  ShoppingBasket,
  ChevronRight,
  Sparkles,
  TrendingDown,
  Store,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  name_ar: string;
}
interface Product {
  id: number;
  name: string;
  name_ar: string;
  brand: string;
  unit: string;
}
interface Price {
  product_id: number;
  store_id: number;
  price: number;
  old_price: number | null;
  store: { id: number; name: string };
}
interface Promo {
  id: number;
  discount_percent: number;
  promo_price: number;
  product: { name: string; brand: string };
  store: { name: string };
  start_date: string;
  end_date: string;
}

const categoryColors = [
  'from-pink-500 to-rose-400',
  'from-violet-500 to-purple-400',
  'from-blue-500 to-cyan-400',
  'from-amber-500 to-orange-400',
  'from-emerald-500 to-teal-400',
  'from-red-500 to-pink-400',
  'from-indigo-500 to-blue-400',
  'from-fuchsia-500 to-pink-400',
  'from-teal-500 to-emerald-400',
];

const chipColors = [
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-violet-100 text-violet-700 border-violet-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-red-100 text-red-700 border-red-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  'bg-teal-100 text-teal-700 border-teal-200',
];

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
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const loadPrices = async (product: Product) => {
    setSelectedProduct(product);
    setLoading(true);
    try {
      const res = await api.get(`/products/compare/${product.id}`);
      setPrices(res.data.prices || res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/products/search?q=${q}`);
      setSearchResults(res.data.products || res.data);
    } catch {}
  };

  const goBack = () => {
    if (selectedProduct) {
      setSelectedProduct(null);
      setPrices([]);
    } else if (selectedCat) {
      setSelectedCat(null);
      setProducts([]);
    }
  };

  const cheapestPrice =
    prices.length > 0
      ? Math.min(...prices.map((p) => parseFloat(String(p.price))))
      : 0;
  const mostExpensive =
    prices.length > 0
      ? Math.max(...prices.map((p) => parseFloat(String(p.price))))
      : 0;
  const savings = mostExpensive - cheapestPrice;

  const currentTitle = selectedProduct
    ? selectedProduct.name
    : selectedCat
      ? selectedCat.name
      : 'Comparer les Prix';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 px-5 pt-14 pb-8 rounded-b-[32px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="flex items-center gap-3 mb-5 relative z-10">
          {selectedCat || selectedProduct ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={goBack}
              className="p-2.5 bg-white/20 backdrop-blur-sm rounded-2xl text-white"
            >
              <ChevronLeft size={20} />
            </motion.button>
          ) : (
            <Link
              href="/"
              className="p-2.5 bg-white/20 backdrop-blur-sm rounded-2xl text-white"
            >
              <ChevronLeft size={20} />
            </Link>
          )}
          <div className="flex-1">
            <motion.h1
              key={currentTitle}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold text-white"
            >
              {currentTitle}
            </motion.h1>
            {selectedProduct && (
              <p className="text-pink-100 text-xs mt-0.5">
                {selectedProduct.brand} - {selectedProduct.unit}
              </p>
            )}
          </div>
          <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-2xl">
            <ShoppingBasket size={20} className="text-white" />
          </div>
        </div>

        {/* Search Bar */}
        {!selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative z-10"
          >
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher un produit, une marque..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl text-sm outline-none shadow-lg shadow-pink-900/10 placeholder:text-gray-400 focus:ring-2 focus:ring-white/50 transition-all"
            />
            {searchResults.length > 0 && searchQuery.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 mt-2 z-30 max-h-52 overflow-y-auto"
              >
                {searchResults.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      loadPrices(p);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="w-full text-left px-4 py-3.5 hover:bg-pink-50 text-sm border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-8 h-8 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ShoppingBasket size={14} className="text-pink-500" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">
                        {p.name}
                      </span>
                      <span className="text-gray-400 ml-1.5 text-xs">
                        {p.brand}
                      </span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <div className="px-5 pt-5">
        <AnimatePresence mode="wait">
          {/* ======= PRICE COMPARISON VIEW ======= */}
          {selectedProduct && (
            <motion.div
              key="prices"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 rounded-2xl bg-white animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <>
                  {/* Savings Banner */}
                  {savings > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 mb-5 text-center shadow-lg shadow-emerald-200/50 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <TrendingDown
                        size={28}
                        className="text-white/80 mx-auto mb-2"
                      />
                      <p className="text-white font-black text-2xl">
                        Economise {savings.toFixed(2)} DH
                      </p>
                      <p className="text-emerald-100 text-xs mt-1">
                        En choisissant le magasin le moins cher
                      </p>
                    </motion.div>
                  )}

                  {/* Price Bar Chart */}
                  {prices.length > 1 && (
                    <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 size={16} className="text-pink-500" />
                        <h3 className="font-bold text-sm text-gray-700">
                          Comparaison visuelle
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {prices.map((p, i) => {
                          const price = parseFloat(String(p.price));
                          const isCheapest = price === cheapestPrice;
                          const barWidth =
                            mostExpensive > 0
                              ? (price / mostExpensive) * 100
                              : 0;
                          return (
                            <motion.div
                              key={p.store_id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-600">
                                  {p.store?.name}
                                </span>
                                <span
                                  className={`text-xs font-bold ${isCheapest ? 'text-emerald-600' : 'text-gray-500'}`}
                                >
                                  {price.toFixed(2)} DH
                                </span>
                              </div>
                              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${barWidth}%` }}
                                  transition={{
                                    delay: i * 0.1 + 0.2,
                                    duration: 0.6,
                                    ease: 'easeOut',
                                  }}
                                  className={`h-full rounded-full ${isCheapest ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-pink-300 to-pink-400'}`}
                                />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Store Price Cards */}
                  <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                    <Store size={16} className="text-pink-500" />
                    Detailler par magasin
                  </h3>
                  <div className="space-y-2.5">
                    {prices
                      .slice()
                      .sort(
                        (a, b) =>
                          parseFloat(String(a.price)) -
                          parseFloat(String(b.price)),
                      )
                      .map((p, i) => {
                        const price = parseFloat(String(p.price));
                        const isCheapest = price === cheapestPrice;
                        const savingsFromThis = price - cheapestPrice;
                        return (
                          <motion.div
                            key={p.store_id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className={`bg-white rounded-2xl shadow-sm border-2 p-4 ${isCheapest ? 'border-emerald-300 shadow-emerald-100/50' : 'border-gray-100'} relative overflow-hidden`}
                          >
                            {isCheapest && (
                              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-yellow-400 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                                MEILLEUR PRIX
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base ${isCheapest ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}
                                >
                                  {p.store?.name?.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-semibold text-sm text-gray-800">
                                    {p.store?.name}
                                  </span>
                                  {!isCheapest && savingsFromThis > 0 && (
                                    <p className="text-[11px] text-red-400 mt-0.5">
                                      +{savingsFromThis.toFixed(2)} DH de plus
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-black text-lg ${isCheapest ? 'text-emerald-600' : 'text-gray-700'}`}
                                >
                                  {price.toFixed(2)}{' '}
                                  <span className="text-xs font-medium">
                                    DH
                                  </span>
                                </span>
                                {isCheapest && (
                                  <Trophy
                                    size={22}
                                    className="text-amber-400"
                                    fill="currentColor"
                                  />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ======= PRODUCTS LIST ======= */}
          {selectedCat && !selectedProduct && (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-20 rounded-2xl bg-white animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {products.map((p, i) => (
                    <motion.button
                      key={p.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => loadPrices(p)}
                      className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 text-left hover:shadow-md hover:border-pink-200 transition-all group"
                    >
                      <div className="bg-gradient-to-br from-pink-100 to-rose-100 p-3 rounded-2xl group-hover:from-pink-200 group-hover:to-rose-200 transition-colors">
                        <ShoppingBasket size={20} className="text-pink-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-800 truncate">
                          {p.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {p.brand}{' '}
                          <span className="mx-1 text-gray-300">|</span>{' '}
                          {p.unit}
                        </p>
                      </div>
                      <div className="bg-pink-50 p-2 rounded-xl group-hover:bg-pink-100 transition-colors">
                        <ChevronRight size={16} className="text-pink-400" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ======= CATEGORIES + PROMOS ======= */}
          {!selectedCat && !selectedProduct && (
            <motion.div
              key="cats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Category Chips - horizontal scroll */}
              {categories.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-pink-500" />
                    <h2 className="font-bold text-sm text-gray-700">
                      Categories
                    </h2>
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
                    {categories.map((cat, i) => (
                      <motion.button
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => loadProducts(cat)}
                        className={`flex-shrink-0 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all ${chipColors[i % chipColors.length]} hover:shadow-md`}
                      >
                        {cat.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Grid */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {categories.map((cat, i) => (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.85, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => loadProducts(cat)}
                    className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all group overflow-hidden"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${categoryColors[i % categoryColors.length]} opacity-0 group-hover:opacity-5 transition-opacity`}
                    />
                    <div
                      className={`w-10 h-10 mx-auto mb-2 rounded-2xl bg-gradient-to-br ${categoryColors[i % categoryColors.length]} flex items-center justify-center`}
                    >
                      <ShoppingBasket size={18} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-xs text-gray-800">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {cat.name_ar}
                    </p>
                  </motion.button>
                ))}
              </div>

              {/* Promotions */}
              {promos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-red-100 rounded-lg">
                      <Tag size={14} className="text-red-500" />
                    </div>
                    <h2 className="font-bold text-sm text-gray-700">
                      Promotions du moment
                    </h2>
                    <div className="flex-1" />
                    <span className="text-xs text-red-500 font-medium animate-pulse">
                      EN COURS
                    </span>
                  </div>
                  <div className="space-y-3">
                    {promos.map((promo, i) => (
                      <motion.div
                        key={promo.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm text-gray-800 truncate">
                              {promo.product?.name}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {promo.product?.brand} - {promo.store?.name}
                            </p>
                          </div>
                          <div className="flex-shrink-0 ml-3">
                            <motion.span
                              initial={{ rotate: -5 }}
                              animate={{ rotate: [0, -3, 0] }}
                              transition={{
                                repeat: Infinity,
                                duration: 2,
                                ease: 'easeInOut',
                              }}
                              className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm shadow-red-200"
                            >
                              -{promo.discount_percent}%
                            </motion.span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="font-black text-lg text-emerald-600">
                            {parseFloat(String(promo.promo_price)).toFixed(2)} DH
                          </span>
                          <span className="text-xs text-gray-300 font-medium bg-gray-50 px-2 py-0.5 rounded-md">
                            {promo.store?.name}
                          </span>
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
    </div>
  );
}
