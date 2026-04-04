import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import BottomNav from "@/components/ui/BottomNav";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const APP_URL = "https://hayati.cfd";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#10b981",
};

export const metadata: Metadata = {
  title: {
    default: "HAYATI - حياتك أسهل",
    template: "%s | HAYATI",
  },
  description:
    "L'application marocaine tout-en-un qui simplifie votre quotidien. Gérez vos documents, comparez les prix, trouvez des services fiables, suivez votre budget et explorez le Maroc plus facilement.",
  keywords: [
    "Maroc",
    "Morocco",
    "services",
    "prix",
    "transport",
    "documents",
    "budget",
    "AI",
    "super app",
    "حياتي",
    "المغرب",
  ],
  authors: [{ name: "HAYATI Team" }],
  creator: "HAYATI",
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "HAYATI - حياتك أسهل",
    description:
      "Votre super application marocaine du quotidien. Documents, prix, services, budget et plus.",
    url: APP_URL,
    siteName: "HAYATI",
    locale: "fr_MA",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HAYATI - La super app marocaine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HAYATI - حياتك أسهل",
    description:
      "L'application marocaine tout-en-un pour simplifier votre quotidien.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HAYATI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr" className={inter.variable}>
      <head>
        {/* Arabic font loaded via Google Fonts link for mixed content */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} moroccan-bg text-gray-900 min-h-screen antialiased`}>
        {/* Splash screen */}
        <div id="splash-screen" style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'linear-gradient(135deg, #f5f0e8 0%, #eae5da 50%, #f0ebe2 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.6s ease, visibility 0.6s ease',
        }}>
          <img
            src="/logo.png"
            alt="HAYATI"
            style={{ height: '200px', animation: 'splashPulse 1.8s ease-in-out infinite' }}
          />
          <div style={{
            marginTop: '32px', width: '48px', height: '4px', borderRadius: '2px',
            background: '#e0dbd2', overflow: 'hidden', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #059669, #0d9488)',
              borderRadius: '2px', animation: 'splashBar 1.2s ease-in-out infinite',
            }} />
          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes splashPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.04); opacity: 0.9; }
          }
          @keyframes splashBar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}} />
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('load', function() {
            setTimeout(function() {
              var s = document.getElementById('splash-screen');
              if (s) { s.style.opacity = '0'; s.style.visibility = 'hidden'; }
            }, 1200);
            setTimeout(function() {
              var s = document.getElementById('splash-screen');
              if (s) s.remove();
            }, 1800);
          });
        `}} />
        <AuthProvider>
          <main className="max-w-2xl mx-auto pb-24">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
