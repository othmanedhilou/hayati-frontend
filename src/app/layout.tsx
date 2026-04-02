import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import BottomNav from "@/components/ui/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HAYATI - حياتك أسهل",
  description: "Application marocaine qui simplifie votre quotidien. Gérez vos documents, comparez les prix, trouvez des services fiables et plus encore.",
  keywords: "Maroc, services, prix, transport, documents, budget, AI",
  openGraph: {
    title: "HAYATI - حياتك أسهل",
    description: "Votre super application marocaine du quotidien",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen pb-20`}>
        <AuthProvider>
          <main className="max-w-lg mx-auto">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
