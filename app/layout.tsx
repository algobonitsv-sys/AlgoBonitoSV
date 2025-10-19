
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/layout/FloatingButtons";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import { CartProvider } from "@/contexts/CartContext";
import { AdminSidebarProvider } from "@/contexts/AdminSidebarContext";

const metadata: Metadata = {
  title: "Algo Bonito SV - Joyería Exclusiva",
  description: "¡Decile hola a tu nuevo accesorio favorito!",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <title>{String(metadata.title)}</title>
        <meta name="description" content={metadata.description || ''} />
        {/* Open Graph / Facebook / WhatsApp preview */}
        <meta property="og:title" content={String(metadata.title)} />
        <meta property="og:description" content={String(metadata.description)} />
        <meta property="og:type" content="website" />
        {/* If you have a canonical URL, set it here or provide dynamically */}
        <meta property="og:url" content="https://algobonito-sv.vercel.app/" />
        <meta property="og:image" content="https://algobonito-sv.vercel.app/logo.png" />

        {/* Twitter card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={String(metadata.title)} />
        <meta name="twitter:description" content={String(metadata.description)} />
        <meta name="twitter:image" content="https://algobonito-sv.vercel.app/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-background text-foreground antialiased overflow-x-hidden">
        <CartProvider>
          <AdminSidebarProvider>
            <AnnouncementBar />
            <Header />
            <main>{children}</main>
            <FloatingButtons />
            <Footer />
            <Toaster />
          </AdminSidebarProvider>
        </CartProvider>
      </body>
    </html>
  );
}
