'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, Bot, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Message { id?: number; role: 'user' | 'assistant'; content: string; }

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/chat').then(res => {
      const msgs = res.data.messages || res.data || [];
      if (msgs.length === 0) {
        setMessages([{ role: 'assistant', content: "Salam! Ana HAYATI, l'assistant dyalek 🤖\n\nKifach n9der n3awnek lyoum? N9der n3awnek f:\n\n📄 Gestion des papiers\n🚕 Transport\n💰 Budget\n🛠️ Services locaux\n🛒 Comparaison des prix" }]);
      } else {
        setMessages(msgs);
      }
    }).catch(() => {
      setMessages([{ role: 'assistant', content: "Salam! Ana HAYATI, l'assistant dyalek 🤖\n\nKifach n9der n3awnek lyoum?" }]);
    }).finally(() => setInitialLoad(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/chat/ai', { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, une erreur s'est produite. Réessaie!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 pt-6 pb-4 flex items-center gap-3 shadow-md">
        <Link href="/" className="p-2 bg-white/20 rounded-xl text-white"><ChevronLeft size={20} /></Link>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl"><Bot size={22} className="text-white" /></div>
          <div>
            <h1 className="text-white font-bold">Assistant HAYATI</h1>
            <p className="text-emerald-100 text-xs">Powered by AI • Darija / Français</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {initialLoad ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-emerald-500" size={24} /></div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white rounded-br-md'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Kteb message dyalek..."
            className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 text-sm"
            disabled={loading}
          />
          <motion.button whileTap={{ scale: 0.9 }} type="submit" disabled={loading || !input.trim()}
            className="bg-emerald-500 text-white p-3 rounded-xl disabled:opacity-50 hover:bg-emerald-600 transition">
            <Send size={18} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
