import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import BottomNav from "@/components/ui/BottomNav";
import SplashScreen from "@/components/ui/SplashScreen";

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
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
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
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        {/* Arabic font loaded via Google Fonts link for mixed content */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} moroccan-bg text-gray-900 min-h-screen antialiased`}>
        <AuthProvider>
          <SplashScreen />
          <BottomNav />
          <main className="max-w-2xl mx-auto pb-24 lg:ml-72 lg:max-w-none lg:mx-0 lg:pb-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
