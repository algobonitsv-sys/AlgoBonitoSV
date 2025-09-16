      "use client";

      import Link from "next/link";
      import { useState, useEffect } from "react";
      import { useRouter } from "next/navigation";
      import {
        Menu,
        Search,
        ShoppingBag,
        X,
        ChevronLeft,
      } from "lucide-react";
      import { Button } from "@/components/ui/button";
      import { Input } from "@/components/ui/input";
  import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
      import OrderCart from "@/components/cart/OrderCart";
      import { usePathname } from "next/navigation";
      import { cn } from "@/lib/utils";
      import {
          NavigationMenu,
          NavigationMenuContent,
          NavigationMenuItem,
          NavigationMenuLink,
          NavigationMenuList,
          NavigationMenuTrigger,
          navigationMenuTriggerStyle,
      } from "@/components/ui/navigation-menu";
      import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
      import Image from "next/image";



const productCategories = {
    "Aros": ["Acero quirúrgico", "Acero blanco", "Acero dorado", "Plata 925"],
    "Collares": ["Acero quirúrgico", "Acero blanco", "Acero dorado", "Plata 925"],
    "Anillos": ["Acero quirúrgico", "Acero blanco", "Acero dorado", "Plata 925"],
    "Pulseras": ["Acero quirúrgico", "Acero blanco", "Acero dorado", "Plata 925"],
}

const singleProductLinks = [
    { title: "Piercings", href: "/products/piercings", description: "Ver todos los piercings" },
    { title: "Accesorios", href: "/products/accesorios", description: "Ver todos los accesorios" },
]

const navLinks = [
  { href: "/about", label: "Sobre Nosotros" },
  { href: "/gallery", label: "Nuestros Clientes" },
  { href: "/materials", label: "Materiales" },
  { href: "/contact", label: "Contacto" },
];

export default function Header() {
  const [showCategories, setShowCategories] = useState(false);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = searchQuery.trim();
      if (!value) {
        setIsSearchOpen(false);
        return;
      }
      if (value.toUpperCase() === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push(`/search?q=${encodeURIComponent(value)}`);
      }
      // Oculta la barra de búsqueda tras ejecutar la navegación
      setIsSearchOpen(false);
    }
  };

  // Si la ruta cambia mientras la barra está abierta, ciérrala (por ejemplo navegación por links)
  useEffect(() => {
    if (isSearchOpen) setIsSearchOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Back button will always render; if there's no meaningful history we fall back to home.
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center">
          {/* Mobile: Left side (placeholder to keep spacing) */}
          <div className="flex flex-1 items-center md:hidden" />
          {/* Desktop: Logo */}
          <div className="hidden md:flex flex-1 md:flex-none">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Algo Bonito SV" className="h-12" />
            </Link>
          </div>
          {/* Mobile: Center Logo */}
          <div className="flex-1 flex justify-center md:hidden">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Algo Bonito SV" className="h-12" />
            </Link>
          </div>
          {/* Right side: Actions */}
          <div className="flex items-center gap-3 pr-4 ml-auto">
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setShowCategories(v => !v)}
                aria-expanded={showCategories}
                className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent flex items-center gap-1",
                  showCategories ? "text-foreground" : "text-foreground/60"
                )}
              >
                <span>Productos</span>
                <svg
                  className={cn("h-4 w-4 transition-transform duration-200", showCategories && "rotate-180")}
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.64645 6.64645C4.84171 6.45118 5.15829 6.45118 5.35355 6.64645L8 9.29289L10.6464 6.64645C10.8417 6.45118 11.1583 6.45118 11.3536 6.64645C11.5488 6.84171 11.5488 7.15829 11.3536 7.35355L8.35355 10.3536C8.15829 10.5488 7.84171 10.5488 7.64645 10.3536L4.64645 7.35355C4.45118 7.15829 4.45118 6.84171 4.64645 6.64645Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <NavigationMenu>
                <NavigationMenuList>
                  {navLinks.map((link) => (
                    <NavigationMenuItem key={link.label}>
                      <NavigationMenuLink href={link.href} className={cn(navigationMenuTriggerStyle(), "bg-transparent", {
                        "text-foreground": pathname && pathname.startsWith(link.href),
                        "text-foreground/60": pathname && !pathname.startsWith(link.href)
                      })}>
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)} className="hover:bg-transparent">
              <Search className="h-5 w-5" />
              <span className="sr-only">Abrir búsqueda</span>
            </Button>
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-transparent" aria-label="Pedido" onClick={() => setSheetOpen(true)}>
                  <ShoppingBag className="h-5 w-5" />
                  <CartBadge />
                  <span className="sr-only">Pedido</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md p-6 flex flex-col">
                <SheetTitle className="sr-only">Pedido</SheetTitle>
                <SheetDescription className="sr-only">
                  Resumen del pedido actual. Ajusta cantidades, elige envío y método de pago y confirma tu pedido por WhatsApp.
                </SheetDescription>
                <OrderCart />
              </SheetContent>
            </Sheet>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="hover:bg-transparent"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Volver</span>
            </Button>
          </div>
        </div>
        {isSearchOpen && (
          <div className="absolute left-0 right-0 pb-4 w-full flex justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-50">
            <div className="relative w-full max-w-xl mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="pl-9 w-full border-none shadow-none focus-visible:ring-0 focus-visible:outline-none bg-background/70 backdrop-blur"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>
        )}
      </header>
      {/* Panel de categorías tipo acordeón */}
      {showCategories && (
        <div
          className="w-full fixed left-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/50 shadow-xl border-b z-40 flex flex-col items-center transition-colors"
          style={{ top: 'calc(var(--announcement-bar-height, 0px) + 5rem)' }}
        >
          {/* Botón de cierre panel categorías */}
          <button
            onClick={() => setShowCategories(false)}
            aria-label="Cerrar categorías"
            className="absolute top-2 right-3 p-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="w-full flex justify-center mt-6 mb-1 pb-4 border-b">
            <Link href="/products" className="font-bold text-lg hover:underline">
              Ver todos los productos
            </Link>
          </div>
          <div className="flex flex-row gap-8 min-h-[300px] px-8 py-6 items-start pb-16">
            {Object.entries(productCategories).map(([category, subcategories]) => (
              <div key={category} className="flex flex-col w-32">
                <Accordion type="single" collapsible>
                  <AccordionItem value={category}>
                    <AccordionTrigger
                      className="font-headline font-bold text-lg mb-2 hover:underline text-left w-full"
                      ref={(el: HTMLElement | null) => {
                        if (el) {
                          // Sobrescribe scrollIntoView para evitar el scroll automático
                          el.scrollIntoView = () => {};
                        }
                      }}
                    >
                      {category}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1" style={{ scrollMarginTop: 0 }}>
                        {subcategories.map(subcategory => (
                          <li key={subcategory}>
                            <Link href={`/products?category=${category.toLowerCase().replace(/\s/g, '-')}&material=${subcategory.toLowerCase().replace(/\s/g, '-')}`} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
                              {subcategory}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}
            {singleProductLinks.map((item) => (
              <div key={item.title} className="flex flex-col w-32">
                <Link
                  href={item.href}
                  className="flex flex-1 items-center justify-between py-4 font-headline font-bold text-lg hover:underline transition-all text-left w-full"
                >
                  {item.title}
                </Link>
              </div>
            ))}
          </div>
          {/* Redes sociales esquina inferior derecha */}
          <div className="absolute bottom-3 right-4 flex items-center gap-4 text-foreground/70">
            <a href="https://www.instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg>
            </a>
            <a href="https://www.facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.5 9.87v-6.99H8.9V12h1.6V9.8c0-1.58.94-2.46 2.38-2.46.69 0 1.41.12 1.41.12v1.55h-.8c-.79 0-1.04.49-1.04 1V12h1.77l-.28 2.88h-1.5v6.99A10 10 0 0 0 22 12"/></svg>
            </a>
            <a href="https://www.tiktok.com" aria-label="TikTok" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 3a7.5 7.5 0 0 0 .11 1.3 4.8 4.8 0 0 0 3.39 3.73 8 8 0 0 1-.06 1.5 6.3 6.3 0 0 1-3.06-.9v5.07a5.7 5.7 0 1 1-5-5.66v2.05a3.67 3.67 0 1 0 2.55 3.5V3h2.07Z"/></svg>
            </a>
          </div>
        </div>
      )}
      {/* Listen for open-cart event globally */}
      <CartOpenListener onOpen={() => setSheetOpen(true)} />
    </>
  );
}

function CartBadge() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { count?: number } | undefined;
      if (detail && typeof detail.count === 'number') setCount(detail.count);
    };
    window.addEventListener('cart-state', handler as EventListener);
    return () => window.removeEventListener('cart-state', handler as EventListener);
  }, []);
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[1.15rem] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center animate-in fade-in zoom-in">
      {count > 99 ? '99+' : count}
    </span>
  );
}

function CartOpenListener({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    const handler = () => onOpen();
    window.addEventListener('open-cart', handler);
    return () => window.removeEventListener('open-cart', handler);
  }, [onOpen]);
  return null;
}

    
