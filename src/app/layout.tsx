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

const APP_URL = "https://hayati.ma";

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
    icon: "/favicon.ico",
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
        <AuthProvider>
          <div className="desktop-container">
            <div className="w-full mx-auto md:rounded-3xl md:shadow-2xl md:border md:border-gray-200/50 md:overflow-hidden bg-gray-50 relative pb-20">
              <main>
                {children}
              </main>
              <BottomNav />
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
