
import Link from 'next/link';
import { 
  Package, 
  Users, 
  MessageSquareQuote, 
  GalleryHorizontal, 
  CircleDollarSign, 
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Settings,
  Wallet
} from 'lucide-react';

const dashboardCards = [
  {
    title: 'Productos',
    href: '/admin/products',
    icon: Package,
    description: 'Gestionar productos y inventario',
    color: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20',
    iconColor: 'text-blue-600'
  },
  {
    title: 'Nombres',
    href: '/admin/names',
    icon: Users,
    description: 'Administrar nombres de clientes',
    color: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20',
    iconColor: 'text-green-600'
  },
  {
    title: 'Modelos',
    href: '/admin/models',
    icon: Users,
    description: 'Gestionar modelos y personas',
    color: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20',
    iconColor: 'text-purple-600'
  },
  {
    title: 'Preguntas frecuentes',
    href: '/admin/faq',
    icon: MessageSquareQuote,
    description: 'Administrar FAQ del sitio',
    color: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20',
    iconColor: 'text-orange-600'
  },
  {
    title: 'Carrusel',
    href: '/admin/carousel',
    icon: GalleryHorizontal,
    description: 'Gestionar imágenes del carrusel',
    color: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20',
    iconColor: 'text-pink-600'
  },
  {
    title: 'Finanzas',
    href: '/admin/finances',
    icon: CircleDollarSign,
    description: 'Ver reportes financieros',
    color: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20',
    iconColor: 'text-yellow-600'
  },
  {
    title: 'Pedidos',
    href: '/admin/orders',
    icon: ShoppingCart,
    description: 'Gestionar pedidos de clientes',
    color: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20',
    iconColor: 'text-red-600'
  },
  {
    title: 'Configuración',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configuración del sistema',
    color: 'bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/20',
    iconColor: 'text-gray-600'
  }
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
        <p className="text-muted-foreground">Gestiona tu tienda desde este panel de control</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Ventas del mes</span>
          </div>
          <p className="text-2xl font-bold mt-2">$12,345</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Productos</span>
          </div>
          <p className="text-2xl font-bold mt-2">156</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium">Pedidos pendientes</span>
          </div>
          <p className="text-2xl font-bold mt-2">8</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium">Caja</span>
          </div>
          <p className="text-2xl font-bold mt-2">$8,750</p>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dashboardCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Link 
                key={card.href} 
                href={card.href}
                className={`p-6 border rounded-lg transition-all duration-200 hover:shadow-md ${card.color}`}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-full bg-background/50 ${card.iconColor}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{card.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Actividad reciente</h2>
        <div className="border rounded-lg bg-card">
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Nuevo pedido recibido - #1234</span>
              <span className="text-muted-foreground ml-auto">Hace 5 min</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Producto actualizado - Collar de Plata</span>
              <span className="text-muted-foreground ml-auto">Hace 1 hora</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Stock bajo - Aros de Acero</span>
              <span className="text-muted-foreground ml-auto">Hace 2 horas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
