'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Send,
  Bot,
  Loader2,
  FileText,
  Bus,
  Wallet,
  ShoppingCart,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
}

const quickActions = [
  { label: 'Documents', icon: FileText, message: 'Quels documents j\'ai besoin pour renouveler ma CIN ?' },
  { label: 'Transport', icon: Bus, message: 'Comment aller de Casa a Rabat en transport ?' },
  { label: 'Budget', icon: Wallet, message: 'Aide-moi a gerer mon budget ce mois' },
  { label: 'Prix', icon: ShoppingCart, message: 'Quel est le prix du lait actuellement ?' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .get('/chat')
      .then((res) => {
        const msgs = res.data.messages || res.data || [];
        if (msgs.length === 0) {
          setMessages([
            {
              role: 'assistant',
              content:
                "Salam! Ana HAYATI, l'assistant dyalek\n\nKifach n9der n3awnek lyoum? N9der n3awnek f:\n\nGestion des papiers\nTransport\nBudget\nServices locaux\nComparaison des prix",
            },
          ]);
        } else {
          setMessages(msgs);
        }
      })
      .catch(() => {
        setMessages([
          {
            role: 'assistant',
            content:
              "Salam! Ana HAYATI, l'assistant dyalek\n\nKifach n9der n3awnek lyoum?",
          },
        ]);
      })
      .finally(() => setInitialLoad(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;

    if (!text) setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/chat/ai', { message: userMsg });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Desole, une erreur s'est produite. Reessaie!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-5 pt-14 pb-5 shadow-lg shadow-emerald-200/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-48 h-16 bg-white/5 rounded-full translate-y-1/2" />

        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/"
            className="p-2.5 bg-white/15 backdrop-blur-sm rounded-2xl text-white hover:bg-white/25 transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-2xl">
                <Bot size={22} className="text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-emerald-500" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Assistant HAYATI</h1>
              <div className="flex items-center gap-1.5">
                <Sparkles size={10} className="text-emerald-200" />
                <p className="text-emerald-100 text-xs">
                  AI - Darija / Francais
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {initialLoad ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <Loader2
                className="animate-spin text-emerald-500"
                size={24}
              />
            </div>
            <p className="text-sm text-gray-400">Chargement...</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot avatar */}
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
                      <Bot size={14} className="text-white" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-md shadow-md shadow-emerald-200/40'
                      : 'bg-white text-gray-800 shadow-md shadow-gray-200/50 border border-gray-100/80 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                  <p
                    className={`text-[10px] mt-1.5 text-right ${msg.role === 'user' ? 'text-emerald-200' : 'text-gray-300'}`}
                  >
                    {new Date().toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Typing indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2.5 justify-start"
          >
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
                <Bot size={14} className="text-white" />
              </div>
            </div>
            <div className="bg-white rounded-2xl rounded-bl-md px-5 py-4 shadow-md shadow-gray-200/50 border border-gray-100/80">
              <div className="flex gap-1.5 items-center">
                <motion.div
                  className="w-2.5 h-2.5 bg-emerald-400 rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: 0,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className="w-2.5 h-2.5 bg-emerald-400 rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: 0.15,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className="w-2.5 h-2.5 bg-emerald-400 rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: 0.3,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 pb-2"
        >
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {quickActions.map((action) => (
              <motion.button
                key={action.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(action.message)}
                className="flex-shrink-0 flex items-center gap-2 bg-white border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-full text-xs font-semibold shadow-sm hover:bg-emerald-50 hover:border-emerald-300 transition-all"
              >
                <action.icon size={14} />
                {action.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="bg-white/90 backdrop-blur-xl border-t border-gray-100 px-4 py-3 pb-8">
        <form onSubmit={handleSubmit} className="flex items-center gap-2.5 max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Kteb message dyalek..."
              className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-2 border-gray-100 outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-50 text-sm transition-all placeholder:text-gray-400"
              disabled={loading}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-3.5 rounded-2xl disabled:opacity-40 shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/50 transition-all"
          >
            <Send size={18} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
