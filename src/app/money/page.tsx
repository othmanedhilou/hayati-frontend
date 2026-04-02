'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Trash2, X, Loader2, TrendingUp, TrendingDown, Wallet, ShoppingCart, Car, Coffee, Home as HomeIcon, Zap, Phone, Fuel, Utensils, Briefcase } from 'lucide-react';
import Link from 'next/link';

const catIcons: Record<string, any> = {
  Salaire: Briefcase, Freelance: Briefcase, Courses: ShoppingCart, Transport: Car, Restaurant: Utensils,
  Loyer: HomeIcon, Factures: Zap, 'Téléphone': Phone, Essence: Fuel, Café: Coffee, Autre: Wallet,
};
const catColors: Record<string, string> = {
  Salaire: 'bg-emerald-50 text-emerald-600', Freelance: 'bg-teal-50 text-teal-600', Courses: 'bg-pink-50 text-pink-600',
  Transport: 'bg-purple-50 text-purple-600', Restaurant: 'bg-orange-50 text-orange-600', Loyer: 'bg-blue-50 text-blue-600',
  Factures: 'bg-amber-50 text-amber-600', 'Téléphone': 'bg-indigo-50 text-indigo-600', Essence: 'bg-red-50 text-red-600',
  Café: 'bg-yellow-50 text-yellow-700', Autre: 'bg-gray-50 text-gray-600',
};

interface Transaction { id: number; type: string; amount: number; category: string; description: string; date: string; }

export default function MoneyPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'expense', amount: '', category: 'Courses', description: '', date: new Date().toISOString().split('T')[0] });

  const month = new Date().toISOString().slice(0, 7);

  const fetchData = async () => {
    try {
      const [txRes, sumRes] = await Promise.all([
        api.get('/transactions'),
        api.get(`/transactions/summary?month=${month}`),
      ]);
      setTransactions(txRes.data.data || txRes.data);
      const s = sumRes.data;
      setSummary({ income: parseFloat(s.income) || 0, expenses: parseFloat(s.expenses) || 0, balance: parseFloat(s.balance) || 0 });
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/transactions', { ...form, amount: parseFloat(form.amount) });
      setShowForm(false);
      setForm({ type: 'expense', amount: '', category: 'Courses', description: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer?')) return;
    try { await api.delete(`/transactions/${id}`); fetchData(); } catch {}
  };

  const pct = summary.income > 0 ? Math.min((summary.expenses / summary.income) * 100, 100) : 0;

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 bg-white rounded-xl shadow-sm"><ChevronLeft size={20} /></Link>
        <h1 className="text-xl font-bold">Mon Budget 💸</h1>
      </div>

      {/* Summary Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white mb-6 shadow-lg">
        <p className="text-sm opacity-80">Solde ce mois</p>
        <p className="text-3xl font-black mt-1">{summary.balance.toLocaleString()} DH</p>
        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} />
            <div><p className="text-xs opacity-70">Revenus</p><p className="font-bold text-sm">{summary.income.toLocaleString()} DH</p></div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown size={16} />
            <div><p className="text-xs opacity-70">Dépenses</p><p className="font-bold text-sm">{summary.expenses.toLocaleString()} DH</p></div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1"><span>Dépenses</span><span>{Math.round(pct)}%</span></div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.3 }}
              className={`h-full rounded-full ${pct > 80 ? 'bg-red-400' : 'bg-white/80'}`} />
          </div>
        </div>
      </motion.div>

      {/* Transactions */}
      <h2 className="font-bold text-sm mb-3 text-gray-700">Transactions récentes</h2>
      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx, i) => {
            const Icon = catIcons[tx.category] || Wallet;
            const color = catColors[tx.category] || catColors.Autre;
            return (
              <motion.div key={tx.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${color}`}><Icon size={18} /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{tx.description || tx.category}</p>
                  <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <p className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'}{parseFloat(String(tx.amount)).toLocaleString()} DH
                </p>
                <button onClick={() => handleDelete(tx.id)} className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
              </motion.div>
            );
          })}
        </div>
      )}

      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-4 bg-emerald-500 text-white p-4 rounded-2xl shadow-lg z-40"><Plus size={24} /></motion.button>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-white rounded-t-3xl w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Ajouter</h2>
                <button onClick={() => setShowForm(false)}><X size={24} className="text-gray-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex bg-gray-100 rounded-xl p-1">
                  {['expense', 'income'].map(t => (
                    <button key={t} type="button" onClick={() => setForm({...form, type: t})}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${form.type === t ? (t === 'expense' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white') : 'text-gray-500'}`}>
                      {t === 'expense' ? 'Dépense' : 'Revenu'}
                    </button>
                  ))}
                </div>
                <input type="number" placeholder="Montant (DH)" required step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 text-lg font-bold text-center" />
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500">
                  {(form.type === 'income' ? ['Salaire', 'Freelance', 'Autre'] : ['Courses', 'Transport', 'Restaurant', 'Loyer', 'Factures', 'Téléphone', 'Essence', 'Café', 'Autre']).map(c => <option key={c}>{c}</option>)}
                </select>
                <input type="text" placeholder="Description (optionnel)" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500" />
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500" />
                <button type="submit" disabled={saving}
                  className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                  {saving && <Loader2 size={18} className="animate-spin" />} Enregistrer
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
