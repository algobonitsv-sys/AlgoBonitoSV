'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  Package,
  Users,
  MessageSquareQuote,
  GalleryHorizontal,
  Sparkles,
  UserCheck,
  Gem,
  CircleDollarSign,
  ShoppingCart,
  Info,
  Megaphone,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { useAdminSidebar } from '@/contexts/AdminSidebarContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/adminpanel', label: 'Dashboard', icon: Home },
  { href: '/adminpanel/products', label: 'Productos', icon: Package },
  { href: '/adminpanel/names', label: 'Categorías', icon: Users },
  { href: '/adminpanel/models', label: 'Subcategorías', icon: Users },
  { href: '/adminpanel/faq', label: 'Preguntas frecuentes', icon: MessageSquareQuote },
  { href: '/adminpanel/carousel', label: 'Carrusel', icon: GalleryHorizontal },
  { href: '/adminpanel/vistaprincipal', label: 'Vista Principal', icon: Sparkles },
  { href: '/adminpanel/about', label: 'Sobre Nosotros', icon: Info },
  { href: '/adminpanel/materials', label: 'Materiales', icon: Gem },
  { href: '/adminpanel/testimonials', label: 'Nuestros clientes', icon: UserCheck },
  { href: '/adminpanel/announcementbar', label: 'Announcement Bar', icon: Megaphone },
  { href: '/adminpanel/finances', label: 'Finanzas', icon: CircleDollarSign },
  { href: '/adminpanel/orders', label: 'Pedidos', icon: ShoppingCart },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useAdminSidebar();

  // Handle click outside to close sidebar on mobile
  const handleClickOutside = useCallback(() => {
    if (isSidebarOpen && window.innerWidth < 768) { // Only on mobile (below md breakpoint)
      setSidebarOpen(false);
    }
  }, [isSidebarOpen, setSidebarOpen]);

  // Hide announcement bar when in admin panel
  useEffect(() => {
    document.body.setAttribute('data-admin', 'true');
    
    return () => {
      document.body.setAttribute('data-admin', 'false');
    };
  }, []);

  // DEVELOPMENT MODE: Skip auth check for admin access
  // TODO: Re-enable auth check when auth system is ready
  /*
  // Redirect non-admin users
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);
  */

  // DEVELOPMENT MODE: Skip loading check
  // TODO: Re-enable loading check when auth system is ready
  /*
  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user || !isAdmin) {
    return null;
  }
  */

  return (
    <div className="min-h-[1050px] md:min-h-screen">
      {/* Fixed Header - Only visible on desktop */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 hidden md:flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="mr-4"
          title={isSidebarOpen ? 'Ocultar sidebar' : 'Mostrar sidebar'}
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Panel de Administración</h1>
      </header>

      {/* Fixed Sidebar */}
      <div
        aria-hidden={!isSidebarOpen}
        className={cn(
          'fixed left-0 top-16 w-[183.125px] bg-white border-r border-gray-200 z-40 transition-transform duration-300 ease-in-out transform md:translate-x-0 md:opacity-100 md:pointer-events-auto min-h-[1050px]',
          isSidebarOpen
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : '-translate-x-full opacity-0 pointer-events-none'
        )}
        style={{ height: '1050px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar Header */}
        <div className="flex flex-col items-center p-4 border-b">
          <h3 className="text-sm font-bold text-black">ADMIN PANEL</h3>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="mt-6">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 hover:text-gray-900 ${
                      isActive 
                        ? 'bg-gray-100 text-gray-900 font-medium' 
                        : 'text-gray-500'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      
      {/* Main Content Area */}
      <div
        className={cn(
          'w-full transition-all duration-300',
          isSidebarOpen ? 'md:ml-[183.125px]' : 'md:ml-0'
        )}
        onClick={handleClickOutside}
      >
        <main
          className={cn(
            'min-h-[1050px] md:min-h-screen pt-6 p-4 md:p-6 transition-all duration-300 overflow-y-auto',
            isSidebarOpen ? 'md:mr-[288.5px]' : 'md:mr-[32.5px]'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div style={{ display: 'none' }} id="admin-footer-hider" />
      <style dangerouslySetInnerHTML={{
        __html: `
          body footer {
            display: none !important;
          }
        `
      }} />
      <AdminLayoutContent>{children}</AdminLayoutContent>
      <Toaster />
    </>
  );
}