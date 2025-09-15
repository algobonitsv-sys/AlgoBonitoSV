
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

const navItems = [
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/names', label: 'Nombres', icon: Users },
  { href: '/admin/models', label: 'Modelos', icon: Users },
  { href: '/admin/faq', label: 'Preguntas frecuentes', icon: MessageSquareQuote },
  { href: '/admin/carousel', label: 'Carrusel', icon: GalleryHorizontal },
  { href: '/admin/finances', label: 'Finanzas', icon: CircleDollarSign },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
  <Sidebar className="peer z-40 border-r">
        <SidebarHeader />
  <SidebarContent className='pt-14 md:pt-0 border-r'>
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
            <SidebarTrigger className="md:hidden" />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
