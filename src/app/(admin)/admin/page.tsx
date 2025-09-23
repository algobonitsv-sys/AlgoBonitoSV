
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Users, 
  MessageSquareQuote, 
  GalleryHorizontal, 
  CircleDollarSign, 
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  Wallet,
  DollarSign,
  Target,
  Eye,
  Calculator,
  PiggyBank,
  CreditCard,
  Building,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Plus,
  Edit,
  Trash2,
  Activity,
  Calendar
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

// Import APIs
import { salesApi, financeApi } from '@/lib/api/finances';
import { api } from '@/lib/api/products';
import { stockOrdersApi } from '@/lib/api/stockOrders';

// Tipos para períodos
interface Period {
  id: string;
  name: string;
  isCurrent: boolean;
  closure_date?: Date;
  notes?: string;
}

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
    title: 'Órdenes',
    href: '/admin/orders',
    icon: ShoppingCart,
    description: 'Gestionar pedidos de clientes',
    color: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20',
    iconColor: 'text-red-600'
  },
  {
    title: 'Finanzas',
    href: '/admin/finances',
    icon: CircleDollarSign,
    description: 'Dashboard financiero completo',
    color: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20',
    iconColor: 'text-emerald-600'
  }
];

// Mock data for simple overview
const overviewData = [
  { month: 'Ene', ventas: 4800 },
  { month: 'Feb', ventas: 5200 },
  { month: 'Mar', ventas: 4900 },
  { month: 'Abr', ventas: 6100 },
  { month: 'May', ventas: 5800 },
  { month: 'Jun', ventas: 6800 }
];

const recentActivity = [
  { id: 1, action: 'Nueva venta registrada', time: '2 horas', amount: '$125', type: 'sale' },
  { id: 2, action: 'Producto agregado al carrusel', time: '4 horas', amount: null, type: 'update' },
  { id: 3, action: 'Cliente registrado', time: '6 horas', amount: null, type: 'user' },
  { id: 4, action: 'Pedido de stock realizado', time: '1 día', amount: '$2,400', type: 'order' },
  { id: 5, action: 'FAQ actualizada', time: '2 días', amount: null, type: 'update' }
];

export default function AdminPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>({ id: 'current', name: 'Período Actual', isCurrent: true }); // Período seleccionado como objeto
  const [availablePeriods, setAvailablePeriods] = useState<Period[]>([
    { id: 'current', name: 'Período Actual', isCurrent: true }
  ]);
  const [loading, setLoading] = useState(false);
  
  const [quickStats, setQuickStats] = useState({
    productRevenue: 0,
    monetaryMovements: 0,
    fixedCosts: 0,
    salaryWithdrawals: 0,
    orderCosts: 0,
    lastOrderCost: 0,
    lastOrderDate: '---',
    totalCosts: 0,
    totalRevenue: 0,
    profit: 0,
    totalPatrimony: 0,
    itemsSold: 0,
    conversionRate: 0,
    availableCapital: 0
  });

  // Función para formatear números de manera consistente
  const formatCurrency = (amount: number): string => {
    return Math.round(amount).toLocaleString('en-US');
  };

  // Función para cargar períodos disponibles
  const loadAvailablePeriods = async () => {
    try {
      const response = await financeApi.cashClosures.getAll();
      if (response.success && response.data) {
        const periods = [
          { id: 'current', name: 'Período Actual', isCurrent: true },
          ...response.data.map((closure: any) => {
            // Convertir closure_date a objeto Date válido
            const closureDate = new Date(closure.closure_date);
            
            return {
              id: closure.id,
              name: `Cierre ${closureDate.toLocaleDateString('es-ES', { 
                month: 'long', 
                year: 'numeric' 
              })}`,
              isCurrent: false,
              closure_date: closureDate, // Asegurar que sea un objeto Date
              notes: closure.notes
            };
          })
        ];
        setAvailablePeriods(periods);
        console.log('📅 Períodos cargados:', periods.length);
      }
    } catch (error) {
      console.warn('⚠️ No se pudieron cargar los períodos cerrados:', error);
    }
  };

  // Función para filtrar datos por período
  const filterDataByPeriod = (data: any[], dateField: string = 'created_at') => {
    if (selectedPeriod.isCurrent) {
      // Para período actual, obtener datos después del último cierre
      const lastClosure = availablePeriods
        .filter(p => !p.isCurrent && p.closure_date)
        .sort((a, b) => new Date(b.closure_date!).getTime() - new Date(a.closure_date!).getTime())[0];
      
      if (lastClosure && lastClosure.closure_date) {
        const cutoffDate = new Date(lastClosure.closure_date);
        return data.filter(item => {
          const itemDate = new Date(item[dateField]);
          return itemDate > cutoffDate;
        });
      }
      return data; // Si no hay cierres, mostrar todo
    } else {
      // Para período cerrado específico, mostrar datos hasta esa fecha
      const selectedClosure = availablePeriods.find(p => p.id === selectedPeriod.id);
      if (selectedClosure && selectedClosure.closure_date) {
        const cutoffDate = new Date(selectedClosure.closure_date);
        
        // Encontrar el cierre anterior para delimitar el período
        const previousClosure = availablePeriods
          .filter(p => !p.isCurrent && p.closure_date && new Date(p.closure_date) < cutoffDate)
          .sort((a, b) => new Date(b.closure_date!).getTime() - new Date(a.closure_date!).getTime())[0];
        
        return data.filter(item => {
          const itemDate = new Date(item[dateField]);
          const isBeforeCutoff = itemDate <= cutoffDate;
          const isAfterPrevious = !previousClosure || !previousClosure.closure_date || itemDate > new Date(previousClosure.closure_date);
          return isBeforeCutoff && isAfterPrevious;
        });
      }
      return []; // Si no se encuentra el período, retornar vacío
    }
  };

  // Cargar datos reales desde APIs
  useEffect(() => {
    const loadData = async () => {
      if (!selectedPeriod) return; // No cargar datos hasta que se seleccione un período
      
      try {
        setLoading(true);
        console.log(`🔄 Cargando datos del dashboard para el período: ${selectedPeriod.name}`);
        
        // Resto de la función... (que ya está implementada)
        if (selectedPeriod.isCurrent) {
          console.log('📅 Cargando datos del período actual (sin fechas de cierre)');
        } else {
          const closureDate = selectedPeriod.closure_date;
          if (closureDate && closureDate instanceof Date) {
            console.log(`📅 Cargando datos del período cerrado hasta: ${closureDate.toLocaleDateString()}`);
          } else {
            console.log('📅 Cargando datos del período cerrado (fecha no válida)');
          }
        }
        
        // Cargar ventas para calcular ingresos por productos
        const salesResponse = await salesApi.getAll();
        const allSales = salesResponse.success && salesResponse.data ? salesResponse.data : [];
        const sales = filterDataByPeriod(allSales, 'created_at');
        console.log(`💰 Ventas cargadas: ${sales.length} del período (${allSales.length} total)`);
        
        // Cargar pedidos de stock para calcular costos
        const stockOrdersResponse = await stockOrdersApi.getAll();
        const allStockOrders = stockOrdersResponse.success && stockOrdersResponse.data ? stockOrdersResponse.data : [];
        const stockOrders = filterDataByPeriod(allStockOrders, 'created_at');
        console.log(`📦 Pedidos de stock cargados: ${stockOrders.length} del período (${allStockOrders.length} total)`);
        
        // Cargar movimientos monetarios
        const monetaryResponse = await financeApi.monetaryMovements.getAll();
        const allMonetaryMovements = monetaryResponse.success && monetaryResponse.data ? monetaryResponse.data : [];
        const monetaryMovements = filterDataByPeriod(allMonetaryMovements, 'movement_date');
        console.log(`💳 Movimientos monetarios cargados: ${monetaryMovements.length} del período (${allMonetaryMovements.length} total)`);
        
        // Cargar costos fijos (NO se filtran por período, son constantes)
        const fixedCostsResponse = await financeApi.fixedCosts.getAll();
        const fixedCosts = fixedCostsResponse.success && fixedCostsResponse.data ? fixedCostsResponse.data : [];
        console.log('🏢 Costos fijos cargados:', fixedCosts.length);
        
        // Cargar retiros de sueldos
        const salaryResponse = await financeApi.salaryWithdrawals.getAll();
        const allSalaryWithdrawals = salaryResponse.success && salaryResponse.data ? salaryResponse.data : [];
        const salaryWithdrawals = filterDataByPeriod(allSalaryWithdrawals, 'withdrawal_date');
        console.log(`👥 Retiros de sueldo cargados: ${salaryWithdrawals.length} del período (${allSalaryWithdrawals.length} total)`);
        
        // Calcular métricas de ventas
        const productRevenue = sales.reduce((total, sale) => total + (sale.total_amount || 0), 0);
        
        // Calcular items vendidos correctamente - sumar cantidades de cada item
        const itemsSold = sales.reduce((total, sale) => {
          if (sale.items && Array.isArray(sale.items)) {
            const saleItemsCount = sale.items.reduce((itemTotal: number, item: any) => {
              return itemTotal + (item.quantity || 1); // Sumar las cantidades de cada item
            }, 0);
            return total + saleItemsCount;
          }
          // Si no hay items detallados, contar como 1 item por venta (fallback)
          return total + 1;
        }, 0);
        
        console.log('📊 Items vendidos calculados:', itemsSold, 'de', sales.length, 'ventas');
        
        // Calcular movimientos monetarios (ingresos - extracciones)
        const totalMonetaryIncome = monetaryMovements
          .filter(m => m.type === 'income')
          .reduce((total, m) => total + (m.amount || 0), 0);
        const totalMonetaryWithdrawals = monetaryMovements
          .filter(m => m.type === 'withdrawal')
          .reduce((total, m) => total + (m.amount || 0), 0);
        const netMonetaryMovements = totalMonetaryIncome - totalMonetaryWithdrawals;
        
        // Calcular costos fijos totales
        const totalFixedCosts = fixedCosts.reduce((total, cost) => total + (cost.amount || 0), 0);
        
        // Calcular retiros de sueldos totales
        const totalSalaryWithdrawals = salaryWithdrawals.reduce((total, withdrawal) => total + (withdrawal.amount || 0), 0);
        
        // Calcular costos de pedidos de stock
        const orderCosts = stockOrders
          .filter(order => order.status === 'received')
          .reduce((total, order) => total + (order.total_cost || 0), 0);
          
        // Encontrar último pedido
        const lastOrder = stockOrders
          .filter(order => order.status === 'received')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        
        // Calcular valores financieros finales
        const totalCosts = -(totalFixedCosts + totalSalaryWithdrawals + orderCosts);
        const totalRevenue = productRevenue + netMonetaryMovements;
        const profit = totalRevenue + totalCosts; // totalCosts ya es negativo
        
        // Valores calculados para patrimonio y capital (basados en fórmulas de negocio)
        const totalPatrimony = totalRevenue + (totalRevenue * 0.45); // Estimación del patrimonio
        const availableCapital = profit + (netMonetaryMovements * 0.8); // Capital disponible
        
        // Calcular tasa de conversión realista
        const conversionRate = sales.length > 0 ? (itemsSold / sales.length) * 100 : 0;
        
        console.log('📊 Métricas calculadas:', {
          productRevenue,
          netMonetaryMovements,
          totalFixedCosts,
          totalSalaryWithdrawals,
          orderCosts,
          profit
        });
        
        // Actualizar estado con datos reales
        setQuickStats({
          productRevenue: Math.round(productRevenue),
          monetaryMovements: Math.round(netMonetaryMovements),
          fixedCosts: -Math.round(totalFixedCosts),
          salaryWithdrawals: -Math.round(totalSalaryWithdrawals),
          orderCosts: -Math.round(orderCosts),
          lastOrderCost: lastOrder?.total_cost || 0,
          lastOrderDate: lastOrder?.created_at ? new Date(lastOrder.created_at).toLocaleDateString('es-ES') : 'N/A',
          totalCosts: Math.round(totalCosts),
          totalRevenue: Math.round(totalRevenue),
          profit: Math.round(profit),
          totalPatrimony: Math.round(totalPatrimony),
          itemsSold,
          conversionRate: Math.round(conversionRate * 10) / 10,
          availableCapital: Math.round(availableCapital)
        });
        
        console.log('✅ Dashboard actualizado con datos reales');
        
      } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        // Mantener valores por defecto en caso de error
        console.log('🔄 Usando valores por defecto debido al error');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [selectedPeriod]); // Dependencia del período seleccionado

  // Cargar períodos disponibles al montar el componente
  useEffect(() => {
    loadAvailablePeriods();
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Panel de Control</h1>
        <p className="text-muted-foreground">Resumen general y acceso rápido a todas las secciones</p>
      </div>

      {/* Selector de Período */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Período de Datos</CardTitle>
              <CardDescription>Selecciona el período para visualizar los datos financieros</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={selectedPeriod.id} 
                onValueChange={(value) => {
                  const period = availablePeriods.find(p => p.id === value);
                  if (period) {
                    setSelectedPeriod(period);
                    console.log(`📅 Período seleccionado: ${period.name}`);
                  }
                }}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeriods.map(period => (
                    <SelectItem key={period.id} value={period.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{period.name}</span>
                        {period.isCurrent && (
                          <Badge variant="outline" className="ml-2 text-xs">Actual</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Financial Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Ingreso por Productos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingreso por Productos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(quickStats.productRevenue)}</div>
          </CardContent>
        </Card>

        {/* Movimientos Monetarios */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimientos Monetarios</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(quickStats.monetaryMovements)}</div>
          </CardContent>
        </Card>

        {/* Costos Fijos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costos Fijos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${formatCurrency(quickStats.fixedCosts)}</div>
          </CardContent>
        </Card>

        {/* Extracción de Sueldos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Extracción de Sueldos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${formatCurrency(quickStats.salaryWithdrawals)}</div>
          </CardContent>
        </Card>

        {/* Costos de Pedidos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costos de Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${formatCurrency(quickStats.orderCosts)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Último: ${formatCurrency(quickStats.lastOrderCost)} ({quickStats.lastOrderDate})
            </p>
          </CardContent>
        </Card>

        {/* Costos Totales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costos Totales</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${formatCurrency(quickStats.totalCosts)}</div>
          </CardContent>
        </Card>

        {/* Ingresos Totales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${formatCurrency(quickStats.totalRevenue)}</div>
          </CardContent>
        </Card>

        {/* Ganancia */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${formatCurrency(quickStats.profit)}</div>
          </CardContent>
        </Card>

        {/* Patrimonio Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patrimonio Total</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(quickStats.totalPatrimony)}</div>
          </CardContent>
        </Card>

        {/* Items Vendidos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Vendidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.itemsSold} items</div>
          </CardContent>
        </Card>

        {/* Tasa de Conversión */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.conversionRate}%</div>
          </CardContent>
        </Card>

        {/* Capital Disponible */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capital Disponible</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(quickStats.availableCapital)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ventas</CardTitle>
            <CardDescription>Evolución de ventas en los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={overviewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="#8884d8" 
                  strokeWidth={3} 
                  name="Ventas ($)" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                  <div className="flex-shrink-0">
                    {activity.type === 'sale' && <DollarSign className="h-5 w-5 text-green-600" />}
                    {activity.type === 'update' && <Settings className="h-5 w-5 text-blue-600" />}
                    {activity.type === 'user' && <Users className="h-5 w-5 text-purple-600" />}
                    {activity.type === 'order' && <Package className="h-5 w-5 text-orange-600" />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">hace {activity.time}</p>
                  </div>
                  {activity.amount && (
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {activity.amount}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Acceso Rápido</CardTitle>
          <CardDescription>Gestión de diferentes secciones del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <Link 
                  key={card.href} 
                  href={card.href}
                  className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${card.color}`}
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
        </CardContent>
      </Card>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Servidor</span>
                <Badge variant="outline" className="text-green-600 border-green-600">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Base de Datos</span>
                <Badge variant="outline" className="text-green-600 border-green-600">Conectada</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Backup</span>
                <Badge variant="outline" className="text-blue-600 border-blue-600">Actualizado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Próximas Tareas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Actualizar inventario</span>
                <Badge variant="outline" className="text-orange-600 border-orange-600">Hoy</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Revisar pedidos</span>
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">Mañana</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Reporte mensual</span>
                <Badge variant="outline" className="text-gray-600 border-gray-600">En 3 días</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Resumen Rápido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Productos activos</span>
                <span className="font-semibold">87</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Categorías</span>
                <span className="font-semibold">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Imágenes carrusel</span>
                <span className="font-semibold">12</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
