'use client';

import { useEffect } from 'react';
import { RefreshCw, Home } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl">😕</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Quelque chose a mal tourne</h2>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          Une erreur inattendue s&apos;est produite. Reessayez ou retournez a l&apos;accueil.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-semibold shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/50 transition-all active:scale-[0.97]"
          >
            <RefreshCw size={16} />
            Reessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
          >
            <Home size={16} />
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}
