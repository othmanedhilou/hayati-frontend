'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CreditCard, Car, Shield, Globe, Plus, Trash2, X, Loader2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const typeIcons: Record<string, any> = {
  cin: CreditCard, permis: Car, assurance: Shield, passeport: Globe, carte_grise: Car, autre: FileText,
};
const typeLabels: Record<string, string> = {
  cin: 'CIN', permis: 'Permis de conduire', assurance: 'Assurance', passeport: 'Passeport', carte_grise: 'Carte Grise', autre: 'Autre',
};

interface Doc {
  id: number; title: string; type: string; document_number: string; issue_date: string; expiry_date: string;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'cin', document_number: '', issue_date: '', expiry_date: '' });

  const fetchDocs = async () => {
    try {
      const res = await api.get('/documents');
      setDocs(res.data.documents || res.data.data || res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchDocs(); }, []);

  const daysUntil = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const statusColor = (date: string) => {
    const days = daysUntil(date);
    if (days < 90) return 'text-red-600 bg-red-50 border-red-200';
    if (days < 180) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/documents', form);
      setShowForm(false);
      setForm({ title: '', type: 'cin', document_number: '', issue_date: '', expiry_date: '' });
      fetchDocs();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce document?')) return;
    try { await api.delete(`/documents/${id}`); fetchDocs(); } catch {}
  };

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 bg-white rounded-xl shadow-sm"><ChevronLeft size={20} /></Link>
        <h1 className="text-xl font-bold">Mes Documents 🧾</h1>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence>
            {docs.map((doc) => {
              const Icon = typeIcons[doc.type] || FileText;
              const days = doc.expiry_date ? daysUntil(doc.expiry_date) : null;
              return (
                <motion.div key={doc.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
                >
                  <div className={`p-3 rounded-xl ${doc.expiry_date ? statusColor(doc.expiry_date) : 'bg-gray-50'}`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{doc.title}</h3>
                    <p className="text-xs text-gray-500">{typeLabels[doc.type]} • {doc.document_number}</p>
                    {days !== null && (
                      <p className={`text-xs mt-1 font-medium ${days < 90 ? 'text-red-500' : days < 180 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {days > 0 ? `Expire dans ${days} jours` : 'Expiré!'}
                      </p>
                    )}
                  </div>
                  <button onClick={() => handleDelete(doc.id)} className="p-2 text-gray-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-4 bg-emerald-500 text-white p-4 rounded-2xl shadow-lg hover:bg-emerald-600 transition z-40"
      >
        <Plus size={24} />
      </motion.button>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-white rounded-t-3xl w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Ajouter un document</h2>
                <button onClick={() => setShowForm(false)}><X size={24} className="text-gray-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" placeholder="Titre" required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500" />
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500">
                  {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <input type="text" placeholder="Numéro du document" value={form.document_number} onChange={e => setForm({...form, document_number: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Date d&apos;émission</label>
                    <input type="date" value={form.issue_date} onChange={e => setForm({...form, issue_date: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Date d&apos;expiration</label>
                    <input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <button type="submit" disabled={saving}
                  className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition flex items-center justify-center gap-2">
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
