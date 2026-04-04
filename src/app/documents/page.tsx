'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Plus, Trash2, X, Loader2,
  CreditCard, Car, Shield, Globe, FileText,
  Sparkles, AlertTriangle, Clock, AlertCircle, FolderOpen,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/* ── Type config ── */
const typeIcons: Record<string, any> = {
  cin: CreditCard, permis: Car, assurance: Shield, passeport: Globe, carte_grise: Car, autre: FileText,
};
const typeLabels: Record<string, string> = {
  cin: 'CIN', permis: 'Permis de conduire', assurance: 'Assurance',
  passeport: 'Passeport', carte_grise: 'Carte Grise', autre: 'Autre',
};
const typeGradients: Record<string, string> = {
  cin: 'from-blue-500 to-indigo-600', permis: 'from-purple-500 to-violet-600',
  assurance: 'from-emerald-500 to-teal-600', passeport: 'from-amber-500 to-orange-600',
  carte_grise: 'from-rose-500 to-pink-600', autre: 'from-gray-400 to-gray-500',
};
const typeBgColors: Record<string, string> = {
  cin: 'bg-blue-500/10 text-blue-600', permis: 'bg-purple-500/10 text-purple-600',
  assurance: 'bg-emerald-500/10 text-emerald-600', passeport: 'bg-amber-500/10 text-amber-600',
  carte_grise: 'bg-rose-500/10 text-rose-600', autre: 'bg-gray-500/10 text-gray-600',
};

interface Doc {
  id: number; title: string; type: string; document_number: string;
  issue_date: string; expiry_date: string;
}

/* ── Helpers ── */
function daysUntil(date: string): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function expiryStatus(date: string): 'danger' | 'warning' | 'safe' {
  const d = daysUntil(date);
  if (d < 90) return 'danger';
  if (d < 180) return 'warning';
  return 'safe';
}

const statusStyles = {
  danger: {
    border: 'border-red-300/60 shadow-red-500/10',
    glow: 'shadow-lg shadow-red-500/20',
    badge: 'bg-red-500/10 text-red-600',
    text: 'text-red-500',
    ring: 'ring-2 ring-red-400/30',
  },
  warning: {
    border: 'border-amber-300/60 shadow-amber-500/10',
    glow: 'shadow-lg shadow-amber-500/15',
    badge: 'bg-amber-500/10 text-amber-600',
    text: 'text-amber-500',
    ring: 'ring-2 ring-amber-400/20',
  },
  safe: {
    border: 'border-white/80',
    glow: '',
    badge: 'bg-emerald-500/10 text-emerald-600',
    text: 'text-emerald-500',
    ring: '',
  },
};

/* ── AI Reminder generator ── */
function generateReminder(docs: Doc[]): string | null {
  const expiring = docs
    .filter(d => d.expiry_date && daysUntil(d.expiry_date) < 180 && daysUntil(d.expiry_date) > 0)
    .sort((a, b) => daysUntil(a.expiry_date) - daysUntil(b.expiry_date));

  if (expiring.length === 0) {
    const expired = docs.filter(d => d.expiry_date && daysUntil(d.expiry_date) <= 0);
    if (expired.length > 0) {
      return `${expired.length} document(s) expire(s)! Renouvelle ton ${typeLabels[expired[0].type]} en urgence.`;
    }
    return null;
  }

  const nearest = expiring[0];
  const days = daysUntil(nearest.expiry_date);

  if (days < 30) {
    return `Urgent: Ton ${typeLabels[nearest.type]} expire dans ${days} jours. Prends RDV maintenant!`;
  }
  if (days < 90) {
    return `Ton ${typeLabels[nearest.type]} expire dans ${days} jours. Prepare les documents de renouvellement.`;
  }

  return expiring.length > 1
    ? `${expiring.length} documents expirent bientot. Le plus proche: ${typeLabels[nearest.type]} dans ${days} jours.`
    : `Ton ${typeLabels[nearest.type]} expire dans ${days} jours. Pense a le renouveler.`;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: '', type: 'cin', document_number: '', issue_date: '', expiry_date: '',
  });

  const fetchDocs = async () => {
    try {
      const res = await api.get('/documents');
      setDocs(res.data.documents || res.data.data || res.data);
    } catch (err: any) {
      if (err?.response?.status === 401) setAuthError(true);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchDocs(); }, []);

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
    setDeletingId(id);
    try {
      await api.delete(`/documents/${id}`);
      setDocs(prev => prev.filter(d => d.id !== id));
      fetchDocs();
    } catch {} finally { setDeletingId(null); }
  };

  const reminder = useMemo(() => generateReminder(docs), [docs]);

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
          <p className="text-gray-500 text-sm mb-6">Connecte-toi pour acceder a tes documents.</p>
          <button onClick={() => router.push('/auth')}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/25">
            Se connecter
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-32">
      {/* ── Header ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-xl" />

        <div className="relative z-10 px-5 pt-6 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/"
              className="p-2.5 bg-white/15 backdrop-blur-sm rounded-2xl hover:bg-white/25 transition-all">
              <ChevronLeft size={20} className="text-white" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">Mes Documents</h1>
              <p className="text-xs text-blue-200">{docs.length} document{docs.length !== 1 ? 's' : ''} enregistre{docs.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-2 space-y-4">
        {/* ── AI Reminder Card ── */}
        <AnimatePresence>
          {reminder && !loading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 shadow-lg shadow-black/[0.03] border border-white/80"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Rappel AI</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{reminder}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Document Cards ── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[120px] rounded-2xl bg-white/50 animate-pulse" />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-sm rounded-3xl p-10 text-center border border-white/80 mt-4"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen size={36} className="text-blue-300" />
            </div>
            <p className="text-gray-700 font-semibold text-base mb-1">Aucun document</p>
            <p className="text-gray-400 text-sm">Ajoute tes documents pour ne rien oublier</p>
          </motion.div>
        ) : (
          <motion.div layout className="space-y-3">
            <AnimatePresence mode="popLayout">
              {docs.map((doc, i) => {
                const Icon = typeIcons[doc.type] || FileText;
                const hasExpiry = !!doc.expiry_date;
                const days = hasExpiry ? daysUntil(doc.expiry_date) : null;
                const status = hasExpiry ? expiryStatus(doc.expiry_date) : 'safe';
                const styles = statusStyles[status];
                const iconBg = typeBgColors[doc.type] || typeBgColors.autre;
                const isDeleting = deletingId === doc.id;

                return (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: isDeleting ? 0.5 : 1, y: 0 }}
                    exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-white/80 backdrop-blur-sm rounded-2xl border p-4 group hover:shadow-lg transition-all ${styles.border} ${styles.glow} ${status === 'danger' ? styles.ring : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                        <Icon size={24} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-gray-900 truncate">{doc.title}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{typeLabels[doc.type]}</p>
                          </div>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            disabled={isDeleting}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 shrink-0"
                          >
                            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>

                        {/* Document number */}
                        {doc.document_number && (
                          <p className="text-xs text-gray-500 font-mono mt-1.5 bg-gray-50 inline-block px-2 py-0.5 rounded-md">
                            {doc.document_number}
                          </p>
                        )}

                        {/* Expiry info */}
                        {hasExpiry && days !== null && (
                          <div className="flex items-center gap-1.5 mt-2">
                            {status === 'danger' ? (
                              <AlertTriangle size={13} className="text-red-500" />
                            ) : (
                              <Clock size={13} className={styles.text} />
                            )}
                            <span className={`text-xs font-semibold ${styles.text}`}>
                              {days <= 0
                                ? 'Expire!'
                                : `Expire dans ${days} jour${days > 1 ? 's' : ''}`}
                            </span>

                            {/* Mini progress for urgency */}
                            {days > 0 && days < 365 && (
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden ml-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.max(5, 100 - (days / 365) * 100)}%` }}
                                  transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                                  className={`h-full rounded-full ${
                                    status === 'danger' ? 'bg-red-400' : status === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
                                  }`}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Floating Add Button ── */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setShowForm(true)}
        className="fixed bottom-28 right-5 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-xl shadow-blue-500/30 z-40 flex items-center justify-center"
      >
        <Plus size={26} strokeWidth={2.5} />
      </motion.button>

      {/* ── Slide-up Modal Form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-white rounded-t-[2rem] w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              <div className="px-6 pb-10 pt-2 overflow-y-auto">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-bold text-gray-900">Nouveau document</h2>
                  <button onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition">
                    <X size={22} className="text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Title */}
                  <input
                    type="text" placeholder="Titre du document" required
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-2 border-gray-100 outline-none focus:border-blue-500 font-medium transition-colors"
                  />

                  {/* Type selector as visual grid */}
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">Type de document</p>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(typeLabels).map(([key, label]) => {
                        const TypeIcon = typeIcons[key] || FileText;
                        const isSelected = form.type === key;
                        return (
                          <button
                            key={key} type="button"
                            onClick={() => setForm({ ...form, type: key })}
                            className={`py-3 px-2 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-1.5 ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                            }`}
                          >
                            <TypeIcon size={18} />
                            <span className="text-[10px] font-semibold leading-tight">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Document number */}
                  <input
                    type="text" placeholder="Numero du document"
                    value={form.document_number}
                    onChange={e => setForm({ ...form, document_number: e.target.value })}
                    className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-2 border-gray-100 outline-none focus:border-blue-500 font-mono transition-colors"
                  />

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1.5 block">Emission</label>
                      <input
                        type="date" value={form.issue_date}
                        onChange={e => setForm({ ...form, issue_date: e.target.value })}
                        className="w-full px-3 py-3 bg-gray-50 rounded-2xl border-2 border-gray-100 outline-none focus:border-blue-500 text-sm transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1.5 block">Expiration</label>
                      <input
                        type="date" value={form.expiry_date}
                        onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                        className="w-full px-3 py-3 bg-gray-50 rounded-2xl border-2 border-gray-100 outline-none focus:border-blue-500 text-sm transition-colors"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit" disabled={saving || !form.title}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 disabled:opacity-50 transition-all active:scale-[0.98]"
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
