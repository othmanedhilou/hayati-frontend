'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', city: 'Casablanca',
  });

  if (isAuthenticated && user) {
    return (
      <div className="px-4 pt-12">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 text-white text-center mb-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            {user.name.charAt(0)}
          </div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="opacity-80">{user.email}</p>
          {user.city && <p className="opacity-70 text-sm mt-1">📍 {user.city}</p>}
        </div>
        <button onClick={logout} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition">
          Se déconnecter
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-6 pt-16 pb-12 rounded-b-[40px]">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center text-white">
          <h1 className="text-5xl font-black tracking-tight">HAYATI</h1>
          <p className="text-emerald-100 mt-2 text-lg">حياتك أسهل</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="px-6 -mt-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {['Connexion', 'Inscription'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(i === 0); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  (i === 0 ? isLogin : !isLogin) ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text" placeholder="Nom complet" required
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              />
            )}
            <input
              type="email" placeholder="Email" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} placeholder="Mot de passe" required
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition pr-12"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {!isLogin && (
              <>
                <input
                  type="tel" placeholder="Téléphone (06XXXXXXXX)"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                />
                <select
                  value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                >
                  {['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Oujda', 'Meknès'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </>
            )}
            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {isLogin ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>

          {isLogin && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Demo: <span className="font-mono text-emerald-600">demo@hayati.ma</span> / <span className="font-mono text-emerald-600">password</span>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
