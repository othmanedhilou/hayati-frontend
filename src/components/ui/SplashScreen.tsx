'use client';

import { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1200);
    const removeTimer = setTimeout(() => setVisible(false), 1800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #f5f0e8 0%, #eae5da 50%, #f0ebe2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        visibility: fading ? 'hidden' as const : 'visible' as const,
        transition: 'opacity 0.6s ease, visibility 0.6s ease',
      }}
    >
      <img
        src="/logo.png"
        alt="HAYATI"
        style={{
          height: '200px',
          animation: 'splashPulse 1.8s ease-in-out infinite',
        }}
      />
      <div
        style={{
          marginTop: '32px',
          width: '48px',
          height: '4px',
          borderRadius: '2px',
          background: '#e0dbd2',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #059669, #0d9488)',
            borderRadius: '2px',
            animation: 'splashBar 1.2s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}
