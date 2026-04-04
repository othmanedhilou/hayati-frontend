'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Plus, Trash2, X, Loader2,
  TrendingUp, TrendingDown, Wallet, ShoppingCart, Car, Coffee,
  Home as HomeIcon, Zap, Phone, Fuel, Utensils, Briefcase,
  Sparkles, ArrowUpRight, ArrowDownRight, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/* ── Category config ── */
const catIcons: Record<string, any> = {
  Salaire: Briefcase, Freelance: Briefcase, Courses: ShoppingCart, Transport: Car,
  Restaurant: Utensils, Loyer: HomeIcon, Factures: Zap, 'Téléphone': Phone,
  Essence: Fuel, Café: Coffee, Autre: Wallet,
};
const catColors: Record<string, string> = {
  Salaire: 'from-emerald-500 to-emerald-600', Freelance: 'from-teal-500 to-teal-600',
  Courses: 'from-pink-500 to-rose-600', Transport: 'from-purple-500 to-violet-600',
  Restaurant: 'from-orange-500 to-amber-600', Loyer: 'from-blue-500 to-indigo-600',
  Factures: 'from-amber-500 to-yellow-600', 'Téléphone': 'from-indigo-500 to-blue-600',
  Essence: 'from-red-500 to-rose-600', Café: 'from-yellow-500 to-amber-600',
  Autre: 'from-gray-400 to-gray-500',
};
const catBg: Record<string, string> = {
  Salaire: 'bg-emerald-500/10 text-emerald-500', Freelance: 'bg-teal-500/10 text-teal-500',
  Courses: 'bg-pink-500/10 text-pink-500', Transport: 'bg-purple-500/10 text-purple-500',
  Restaurant: 'bg-orange-500/10 text-orange-500', Loyer: 'bg-blue-500/10 text-blue-500',
  Factures: 'bg-amber-500/10 text-amber-500', 'Téléphone': 'bg-indigo-500/10 text-indigo-500',
  Essence: 'bg-red-500/10 text-red-500', Café: 'bg-yellow-500/10 text-yellow-600',
  Autre: 'bg-gray-500/10 text-gray-500',
};

interface Transaction {
  id: number; type: string; amount: number; category: string; description: string; date: string;
}

/* ── AI Insight generator ── */
function generateInsight(transactions: Transaction[], expenses: number, income: number): string {
  if (transactions.length === 0) {
    return 'Commence a suivre tes depenses pour recevoir des conseils personnalises!';
  }

  const expensesByCategory: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + Number(t.amount);
    });

  const sorted = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0 && income > 0) {
    return 'Excellent! Aucune depense ce mois. Continue comme ca!';
  }

  const [topCat, topAmount] = sorted[0] || ['Autre', 0];
  const pct = expenses > 0 ? Math.round((topAmount / expenses) * 100) : 0;

  const tips: Record<string, string> = {
    Courses: `Tu as depense ${pct}% en Courses ce mois. Essaie BIM ou Marjane pour economiser!`,
    Restaurant: `${pct}% de tes depenses vont aux Restaurants. Cuisine maison = economie + sante!`,
    Transport: `Le Transport represente ${pct}% de tes depenses. Pense au covoiturage!`,
    Essence: `L'Essence coute ${pct}% de ton budget. Compare les prix des stations!`,
    Café: `${pct}% en Cafe! Investis dans une cafetiere pour economiser ${Math.round(topAmount * 0.6)} DH/mois.`,
    Loyer: `Le Loyer prend ${pct}% de tes depenses. C'est ${pct > 40 ? 'un peu eleve' : 'dans la norme'}.`,
    Factures: `Les Factures representent ${pct}%. Verifie tes abonnements pour des economies!`,
  };

  if (income > 0 && expenses > income * 0.9) {
    return 'Attention! Tes depenses depassent 90% de tes revenus. Reduis les depenses non essentielles.';
  }

  return tips[topCat] || `Ta categorie principale est ${topCat} (${pct}%). Fixe-toi un budget pour mieux controler.`;
}

export default function MoneyPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    type: 'expense', amount: '', category: 'Courses', description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const month = new Date().toISOString().slice(0, 7);

  const fetchData = async () => {
    try {
      const [txRes, sumRes] = await Promise.all([
        api.get('/transactions'),
        api.get(`/transactions/summary?month=${month}`),
      ]);
      setTransactions(txRes.data.transactions || txRes.data.data || txRes.data);
      const s = sumRes.data;
      setSummary({
        income: parseFloat(s.total_income || s.income) || 0,
        expenses: parseFloat(s.total_expense || s.expenses) || 0,
        balance: parseFloat(s.balance) || 0,
      });
    } catch (err: any) {
      if (err?.response?.status === 401) setAuthError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/transactions', { ...form, amount: parseFloat(form.amount) });
      setShowForm(false);
      setForm({
        type: 'expense', amount: '', category: 'Courses', description: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchData();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(prev => prev.filter(t => t.id !== id));
      fetchData();
    } catch {} finally { setDeletingId(null); }
  };

  const pct = summary.income > 0 ? Math.min((summary.expenses / summary.income) * 100, 100) : 0;
  const insight = useMemo(
    () => generateInsight(transactions, summary.expenses, summary.income),
    [transactions, summary.expenses, summary.income]
  );

  /* ── Auth guard ── */
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 text-center max-w-sm w-full"
        >
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connexion requise</h2>
          <p className="text-gray-500 text-sm mb-6">Connecte-toi pour acceder a ton budget.</p>
          <button onClick={() => router.push('/auth')}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-semibold shadow-lg shadow-emerald-500/25">
            Se connecter
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-32 lg:pb-8">
      {/* ── Header ── */}
      <div className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link href="/"
          className="p-2.5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 hover:shadow-md transition-all">
          <ChevronLeft size={20} className="text-gray-700" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Mon Budget</h1>
          <p className="text-xs text-gray-400">
            {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* ── Hero Balance Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-6 shadow-2xl shadow-emerald-500/30"
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-xl" />

          <div className="relative z-10">
            <p className="text-emerald-100 text-sm font-medium tracking-wide">Solde du mois</p>
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-4xl font-black text-white mt-1 tracking-tight"
            >
              {loading ? '---' : summary.balance.toLocaleString('fr-FR')} <span className="text-2xl font-bold text-white/80">DH</span>
            </motion.p>

            {/* Income / Expense pills */}
            <div className="flex gap-3 mt-5">
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 bg-green-400/30 rounded-xl flex items-center justify-center">
                  <ArrowUpRight size={18} className="text-green-200" />
                </div>
                <div>
                  <p className="text-[11px] text-emerald-200 font-medium">Revenus</p>
                  <p className="text-sm font-bold text-white">{loading ? '--' : summary.income.toLocaleString('fr-FR')} DH</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
                className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 bg-red-400/30 rounded-xl flex items-center justify-center">
                  <ArrowDownRight size={18} className="text-red-300" />
                </div>
                <div>
                  <p className="text-[11px] text-emerald-200 font-medium">Depenses</p>
                  <p className="text-sm font-bold text-white">{loading ? '--' : summary.expenses.toLocaleString('fr-FR')} DH</p>
                </div>
              </motion.div>
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-emerald-200 font-medium">Depenses / Revenus</span>
                <span className="text-white font-bold">{Math.round(pct)}%</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full transition-colors ${
                    pct > 90 ? 'bg-red-400' : pct > 70 ? 'bg-amber-300' : 'bg-white/90'
                  }`}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── AI Insight Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 shadow-lg shadow-black/[0.03] border border-white/80"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/25">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">Conseil AI</p>
              <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
            </div>
          </div>
        </motion.div>

        {/* ── Transactions List ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm text-gray-700">Transactions recentes</h2>
            <span className="text-xs text-gray-400 font-medium">{transactions.length} operations</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[72px] rounded-2xl bg-white/50 animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/80"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Wallet size={28} className="text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Aucune transaction</p>
              <p className="text-gray-400 text-xs mt-1">Appuie sur + pour commencer</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {transactions.map((tx, i) => {
                  const Icon = catIcons[tx.category] || Wallet;
                  const bgColor = catBg[tx.category] || catBg.Autre;
                  const isDeleting = deletingId === tx.id;

                  return (
                    <motion.div
                      key={tx.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: isDeleting ? 0.5 : 1, y: 0 }}
                      exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/80 p-3.5 flex items-center gap-3 group hover:shadow-md transition-all"
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgColor}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {tx.description || tx.category}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(tx.date).toLocaleDateString('fr-FR', {
                            weekday: 'short', day: 'numeric', month: 'short',
                          })}
                        </p>
                      </div>
                      <p className={`font-bold text-sm tabular-nums ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{parseFloat(String(tx.amount)).toLocaleString('fr-FR')} DH
                      </p>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        disabled={isDeleting}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ── Floating Add Button ── */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setShowForm(true)}
        className="fixed bottom-28 right-5 lg:bottom-8 lg:right-8 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-xl shadow-emerald-500/30 z-40 flex items-center justify-center"
      >
        <Plus size={26} strokeWidth={2.5} />
      </motion.button>

      {/* ── Slide-up Modal Form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-white rounded-t-[2rem] lg:rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col lg:mb-auto lg:mt-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              <div className="px-6 pb-10 pt-2 overflow-y-auto">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-bold text-gray-900">Nouvelle transaction</h2>
                  <button onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition">
                    <X size={22} className="text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Type toggle */}
                  <div className="flex bg-gray-100 rounded-2xl p-1">
                    {['expense', 'income'].map(t => (
                      <button
                        key={t} type="button"
                        onClick={() => setForm({ ...form, type: t, category: t === 'income' ? 'Salaire' : 'Courses' })}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                          form.type === t
                            ? t === 'expense'
                              ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                              : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                            : 'text-gray-400'
                        }`}
                      >
                        {t === 'expense' ? 'Depense' : 'Revenu'}
                      </button>
                    ))}
                  </div>

                  {/* Amount */}
                  <div className="relative">
                    <input
                      type="number" placeholder="0" required step="0.01"
                      value={form.amount}
                      onChange={e => setForm({ ...form, amount: e.target.value })}
                      className="w-full px-4 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 outline-none focus:border-emerald-500 text-3xl font-black text-center transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">DH</span>
                  </div>

                  {/* Category */}
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-2 border-gray-100 outline-none focus:border-emerald-500 font-medium transition-colors"
                  >
                    {(form.type === 'income'
                      ? ['Salaire', 'Freelance', 'Autre']
                      : ['Courses', 'Transport', 'Restaurant', 'Loyer', 'Factures', 'Telephone', 'Essence', 'Cafe', 'Autre']
                    ).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  {/* Description */}
                  <input
                    type="text" placeholder="Description (optionnel)"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-2 border-gray-100 outline-none focus:border-emerald-500 font-medium transition-colors"
                  />

                  {/* Date */}
                  <input
                    type="date" value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-2 border-gray-100 outline-none focus:border-emerald-500 font-medium transition-colors"
                  />

                  {/* Submit */}
                  <button
                    type="submit" disabled={saving || !form.amount}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    {saving && <Loader2 size={20} className="animate-spin" />}
                    Enregistrer
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
