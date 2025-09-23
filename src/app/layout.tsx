

import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/layout/FloatingButtons";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import { CartProvider } from "@/contexts/CartContext";

const metadata: Metadata = {
  title: "Algo Bonito SV - Joyería Exclusiva",
  description: "Descubre joyería elegante y minimalista. Hecho a mano en El Salvador.",
};

import { headers } from 'next/headers';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Detectar si es ruta admin via header 'x-invoke-path' (Next 15) o usar noscript fallback
  const h = await headers();
  const path = (h as any).get?.('x-invoke-path') || '';
  const isAdmin = path.startsWith('/admin');

  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <title>{String(metadata.title)}</title>
        <meta name="description" content={metadata.description || ''} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet" />
        <style>{`:root { --announcement-bar-height: 36px; } body[data-admin="true"] { --announcement-bar-height: 0px; } body[data-admin="true"] .announcement-bar{display:none;} body[data-admin="true"] header.sticky{top:0!important;}`}</style>
      </head>
      <body data-admin={isAdmin ? 'true' : 'false'} className="font-body bg-background text-foreground antialiased overflow-x-hidden">
        <CartProvider>
          {!isAdmin && <AnnouncementBar />}
          <Header />
          <main>{children}</main>
          {!isAdmin && <FloatingButtons />}
          <Footer />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
