'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Shield,
  Sparkles,
} from 'lucide-react';

const cities = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Fes',
  'Tanger',
  'Agadir',
  'Oujda',
  'Meknes',
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: 'Casablanca',
  });

  // ======= AUTHENTICATED PROFILE VIEW =======
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-6 pt-16 lg:pt-8 pb-20 lg:pb-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full" />

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center relative z-10"
          >
            <h1 className="text-white/80 text-sm font-medium mb-1">HAYATI</h1>
            <p className="text-emerald-200 text-xs">Mon Profil</p>
          </motion.div>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-6 -mt-14 relative z-10"
        >
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100/50">
            {/* Avatar */}
            <div className="flex flex-col items-center -mt-14 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-emerald-200/50 ring-4 ring-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-400 text-sm mt-0.5">{user.email}</p>
            </div>

            {/* Info Cards */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3.5">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Mail size={16} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-400 font-medium">Email</p>
                  <p className="text-sm font-semibold text-gray-700 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {user.city && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3.5">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MapPin size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-gray-400 font-medium">
                      Ville
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {user.city}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3.5">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Shield size={16} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-gray-400 font-medium">
                    Statut
                  </p>
                  <p className="text-sm font-semibold text-emerald-600">
                    Compte actif
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="px-6 mt-5"
        >
          <button
            onClick={logout}
            className="w-full py-4 bg-white border-2 border-red-100 text-red-500 rounded-2xl font-semibold hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <LogOut size={18} />
            Se deconnecter
          </button>
        </motion.div>
      </div>
    );
  }

  // ======= LOGIN / REGISTER VIEW =======
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register({
          ...form,
          password_confirmation: form.password,
        });
      }
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-6 pt-20 lg:pt-10 pb-16 rounded-b-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-white/5 rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          >
            <h1 className="text-5xl font-black tracking-tight text-white">
              HAYATI
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-emerald-100 mt-3 text-2xl font-light"
            style={{ fontFamily: 'serif' }}
          >
            حياتك أسهل
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 mt-4"
          >
            <Sparkles size={14} className="text-emerald-200" />
            <p className="text-emerald-200 text-sm">
              Votre super app marocaine
            </p>
            <Sparkles size={14} className="text-emerald-200" />
          </motion.div>
        </motion.div>
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', damping: 25 }}
        className="px-5 -mt-8 pb-8"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-white/50">
          {/* Tab Toggle */}
          <div className="flex bg-gray-100/80 rounded-2xl p-1.5 mb-6">
            {['Connexion', 'Inscription'].map((tab, i) => (
              <motion.button
                key={tab}
                onClick={() => {
                  setIsLogin(i === 0);
                  setError('');
                }}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all relative ${
                  (i === 0 ? isLogin : !isLogin)
                    ? 'text-emerald-700'
                    : 'text-gray-400'
                }`}
              >
                {(i === 0 ? isLogin : !isLogin) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm"
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </motion.button>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-red-50 text-red-600 text-sm p-4 rounded-2xl border border-red-100 overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Nom complet"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white outline-none transition-all text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white outline-none transition-all text-sm"
              />
            </div>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                required
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="w-full pl-11 pr-12 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3.5"
                >
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      placeholder="Telephone (06XXXXXXXX)"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white outline-none transition-all text-sm"
                    />
                  </div>

                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <select
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white outline-none transition-all text-sm appearance-none"
                    >
                      {cities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-emerald-200/50 mt-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {isLogin ? 'Se connecter' : "S'inscrire"}
            </motion.button>
          </form>

          {/* Tagline */}
          {isLogin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-5 text-center"
            >
              <p className="text-xs text-gray-400">
                En continuant, vous acceptez nos conditions d'utilisation
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
