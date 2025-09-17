
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  Package,
  Users,
  MessageSquareQuote,
  GalleryHorizontal,
  CircleDollarSign,
  ShoppingCart,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

const navItems = [
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/names', label: 'Nombres', icon: Users },
  { href: '/admin/models', label: 'Modelos', icon: Users },
  { href: '/admin/faq', label: 'Preguntas frecuentes', icon: MessageSquareQuote },
  { href: '/admin/carousel', label: 'Carrusel', icon: GalleryHorizontal },
  { href: '/admin/finances', label: 'Finanzas', icon: CircleDollarSign },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  // Listen for sidebar toggle events from header
  useEffect(() => {
    const handleSidebarToggle = () => {
      toggleSidebar();
    };

    window.addEventListener('admin-sidebar-toggle', handleSidebarToggle);
    return () => window.removeEventListener('admin-sidebar-toggle', handleSidebarToggle);
  }, [toggleSidebar]);

  return (
    <>
      <Sidebar className="peer z-40 border-r">
        <SidebarHeader />
        <SidebarContent className='pt-14 md:pt-0 border-r'>
          <div className="flex flex-col items-center p-4 border-b">
            <img src="/logo.png" alt="Algo Bonito SV" className="h-12 mb-2" />
            <h3 className="text-sm font-bold text-primary">ADMIN PANEL</h3>
          </div>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href} passHref>
                    <SidebarMenuButton
                        isActive={pathname === item.href}
                        tooltip={{ children: item.label }}
                    >
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                    <SidebarMenuButton>
                        <Settings />
                        <span>Configuración</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="md:peer-[&]:ml-[var(--sidebar-width)] md:peer-data-[state=collapsed]:[&]:ml-[var(--sidebar-width-icon)] transition-all duration-200 ease-linear">
        <header className="flex h-14 items-center border-b bg-background px-2 md:px-4">
          <div className="flex w-full items-center gap-2">
            <h2 className="text-lg font-semibold text-muted-foreground">
              Bienvenido al Panel de Administración
            </h2>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
      <Toaster position="top-right" />
    </SidebarProvider>
  );
}
