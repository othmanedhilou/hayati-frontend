'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold mb-2">Oups! Une erreur</h2>
        <p className="text-gray-500 mb-6 text-sm">Connecte-toi d&apos;abord ou réessaie</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold">
            Réessayer
          </button>
          <a href="/auth" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold">
            Se connecter
          </a>
        </div>
      </div>
    </div>
  );
}
