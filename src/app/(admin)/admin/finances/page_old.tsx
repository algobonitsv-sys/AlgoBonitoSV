
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
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { toast } from "sonner";

// Interfaces
interface FinancialData {
  incomeByProducts: number;
  monetaryMovements: number;
  fixedCosts: number;
  salaryExtractions: number;
  orderCosts: number;
  totalCosts: number;
  totalIncome: number;
  profit: number;
  totalAssets: number;
  itemsSold: number;
  conversionRate: number;
  availableCapital: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  sales: number;
  orders: number;
  views: number;
  revenue: number;
}

interface FixedCost {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  category: string;
}

interface Salary {
  id: string;
  month: string;
  amount: number;
  description: string;
}

interface MonetaryMovement {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

interface ProfitabilityProduct {
  id: string;
  name: string;
  model: string;
  cost: number;
  price: number;
  profit: number;
  margin: number;
}

interface OrderItem {
  product: string;
  model: string;
  color: string;
  cost: number;
  price: number;
  quantity: number;
}

interface StockOrder {
  id: string;
  orderNumber: string;
  date: string;
  items: OrderItem[];
  totalCost: number;
  potentialIncome: number;
  potentialProfit: number;
  margin: number;
}

// Mock data
const mockIncomeByCategory = [
  { name: 'Aros', value: 2400, percentage: 35 },
  { name: 'Collares', value: 1800, percentage: 26 },
  { name: 'Anillos', value: 1200, percentage: 18 },
  { name: 'Pulseras', value: 800, percentage: 12 },
  { name: 'Accesorios', value: 600, percentage: 9 }
];

const mockMonthlyData = [
  { month: 'Ene', income: 4800, expenses: 3200, profit: 1600 },
  { month: 'Feb', income: 5200, expenses: 3400, profit: 1800 },
  { month: 'Mar', income: 4900, expenses: 3100, profit: 1800 },
  { month: 'Abr', income: 6100, expenses: 3800, profit: 2300 },
  { month: 'May', income: 5800, expenses: 3600, profit: 2200 },
  { month: 'Jun', income: 6800, expenses: 4200, profit: 2600 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function FinancesPage() {
  const [financialData, setFinancialData] = useState<FinancialData>({
    incomeByProducts: 28750,
    monetaryMovements: 5000,
    fixedCosts: 3200,
    salaryExtractions: 2000,
    orderCosts: 8500,
    totalCosts: 13700,
    totalIncome: 33750,
    profit: 20050,
    totalAssets: 45320,
    itemsSold: 156,
    conversionRate: 12.8,
    availableCapital: 15500
  });

  // Formato de números para evitar errores de hidratación
  // Initialize formatted data state

  // Usar useEffect para formatear después del montaje del componente
  const [formattedData, setFormattedData] = useState({
    incomeByProducts: "$28,750",
    expensesByCategory: "$13,700",
    monetaryMovements: "$5,000",
    fixedCosts: "$3,200",
    salaryExtractions: "$2,000",
    orderCosts: "$8,500",
    totalCosts: "$13,700",
    totalIncome: "$33,750",
    profit: "$20,050",
    totalAssets: "$45,320",
    availableCapital: "$15,500"
  });

  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Collar Plata Elegante', category: 'Collares', sales: 45, orders: 12, views: 340, revenue: 4500 },
    { id: '2', name: 'Aros Dorados Clásicos', category: 'Aros', sales: 38, orders: 15, views: 280, revenue: 3800 },
    { id: '3', name: 'Anillo Compromiso Oro', category: 'Anillos', sales: 12, orders: 8, views: 150, revenue: 6000 },
    { id: '4', name: 'Pulsera Acero Moderno', category: 'Pulseras', sales: 32, orders: 18, views: 220, revenue: 2400 }
  ]);

  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([
    { id: '1', name: 'Alquiler Local', amount: 800, frequency: 'monthly', category: 'Operativo' },
    { id: '2', name: 'Servicios Públicos', amount: 150, frequency: 'monthly', category: 'Operativo' },
    { id: '3', name: 'Internet y Teléfono', amount: 80, frequency: 'monthly', category: 'Tecnología' },
    { id: '4', name: 'Seguro del Negocio', amount: 1200, frequency: 'yearly', category: 'Seguridad' }
  ]);

  const [salaries, setSalaries] = useState<Salary[]>([
    { id: '1', month: 'Junio 2025', amount: 2000, description: 'Sueldo personal' },
    { id: '2', month: 'Mayo 2025', amount: 1800, description: 'Sueldo personal' },
    { id: '3', month: 'Abril 2025', amount: 2200, description: 'Sueldo personal + bonus' }
  ]);

  const [movements, setMovements] = useState<MonetaryMovement[]>([
    { id: '1', type: 'income', amount: 5000, description: 'Inversión inicial', date: '2025-06-01' },
    { id: '2', type: 'expense', amount: 300, description: 'Gastos bancarios', date: '2025-06-15' },
    { id: '3', type: 'income', amount: 2000, description: 'Préstamo familiar', date: '2025-05-20' }
  ]);

  const [sortBy, setSortBy] = useState<'sales' | 'orders' | 'views'>('sales');
  const [profitSortBy, setProfitSortBy] = useState<'margin' | 'profit' | 'cost' | 'price'>('margin');
  const [profitSortOrder, setProfitSortOrder] = useState<'asc' | 'desc'>('desc');

  // Profitability Products Data
  const [profitabilityProducts, setProfitabilityProducts] = useState<ProfitabilityProduct[]>([
    { id: '1', name: 'Protectores Camara Mate', model: 'iPhone 16', cost: 13000, price: 65000, profit: 52000, margin: 400 },
    { id: '2', name: 'Airpods Pro', model: '2da Generacion', cost: 18500, price: 45500, profit: 27000, margin: 145.95 },
    { id: '3', name: 'Vidrios Templados', model: 'iPhone 15', cost: 650, price: 3250, profit: 2600, margin: 400 },
    { id: '4', name: 'Cargador Inalambrico', model: 'Universal', cost: 8000, price: 15000, profit: 7000, margin: 87.5 }
  ]);

  // Stock Orders Data
  const [stockOrders, setStockOrders] = useState<StockOrder[]>([
    {
      id: '1',
      orderNumber: 'Pedido #8',
      date: '10 de septiembre de 2025',
      items: [
        { product: 'Airpods Pro 2da Generacion', model: 'Replica exacta', color: 'Blanco', cost: 18500, price: 45500, quantity: 4 },
        { product: 'Airpods 4ta Generacion', model: 'Replica exacta', color: 'Blanco', cost: 21000, price: 48750, quantity: 4 },
        { product: 'Vidrios Templados', model: 'iPhone 15', color: 'Transparente', cost: 650, price: 3250, quantity: 10 },
        { product: 'Vidrios Templados', model: 'iPhone 13/14 / iPhone 13 / iPhone 13 Pro / iPhone 14', color: 'Transparente', cost: 650, price: 3250, quantity: 11 }
      ],
      totalCost: 171650,
      potentialIncome: 445250,
      potentialProfit: 273600,
      margin: 159.39
    },
    {
      id: '2',
      orderNumber: 'Pedido #9',
      date: '5 de septiembre de 2025',
      items: [
        { product: 'Collar Plata Elegante', model: 'Diseño Premium', color: 'Plata', cost: 12000, price: 35000, quantity: 8 },
        { product: 'Aros Dorados Clásicos', model: 'Colección Vintage', color: 'Dorado', cost: 8500, price: 25000, quantity: 12 },
        { product: 'Anillo Compromiso Oro', model: 'Solitario Clásico', color: 'Oro Rosa', cost: 45000, price: 120000, quantity: 3 },
        { product: 'Pulsera Acero Moderno', model: 'Diseño Minimalista', color: 'Acero', cost: 6000, price: 18000, quantity: 15 }
      ],
      totalCost: 327000,
      potentialIncome: 820000,
      potentialProfit: 493000,
      margin: 150.76
    },
    {
      id: '3',
      orderNumber: 'Pedido #7',
      date: '28 de agosto de 2025',
      items: [
        { product: 'Cargador Inalambrico', model: 'Fast Charge 15W', color: 'Negro', cost: 8000, price: 22000, quantity: 6 },
        { product: 'Protector Cámara Mate', model: 'iPhone 16 Pro', color: 'Transparente', cost: 2500, price: 8500, quantity: 20 },
        { product: 'Funda Silicona Premium', model: 'iPhone 15', color: 'Azul', cost: 4500, price: 15000, quantity: 15 }
      ],
      totalCost: 165500,
      potentialIncome: 427000,
      potentialProfit: 261500,
      margin: 158.01
    }
  ]);
  const [isAddingCost, setIsAddingCost] = useState(false);
  const [isAddingSalary, setIsAddingSalary] = useState(false);
  const [isAddingMovement, setIsAddingMovement] = useState(false);
  
  // Estados para diálogos de historial
  const [isViewingCostsHistory, setIsViewingCostsHistory] = useState(false);
  const [isViewingSalariesHistory, setIsViewingSalariesHistory] = useState(false);
  const [isViewingMovementsHistory, setIsViewingMovementsHistory] = useState(false);
  
  // Estados para cierre de caja
  const [isClosingCash, setIsClosingCash] = useState(false);
  const [isRevertingCash, setIsRevertingCash] = useState(false);
  const [lastCashCloseDate, setLastCashCloseDate] = useState<string | null>(null);
  const [previousCashCloseDate, setPreviousCashCloseDate] = useState<string | null>(null);

  // Form states
  const [newCost, setNewCost] = useState<{ name: string; amount: number; frequency: 'monthly' | 'yearly'; category: string }>({ name: '', amount: 0, frequency: 'monthly', category: '' });
  const [newSalary, setNewSalary] = useState({ month: '', amount: 0, description: '' });
  const [newMovement, setNewMovement] = useState<{ type: 'income' | 'expense'; amount: number; description: string; date: string }>({ type: 'income', amount: 0, description: '', date: '' });

  // Sort products
  const sortedProducts = [...products].sort((a, b) => b[sortBy] - a[sortBy]);

  // Sort profitability products
  const sortedProfitabilityProducts = [...profitabilityProducts].sort((a, b) => {
    const direction = profitSortOrder === 'desc' ? -1 : 1;
    return direction * (b[profitSortBy] - a[profitSortBy]);
  });

  // Add functions
  const addFixedCost = () => {
    if (!newCost.name || !newCost.amount || !newCost.category) {
      toast.error('Completa todos los campos');
      return;
    }
    
    const cost: FixedCost = {
      id: Date.now().toString(),
      ...newCost
    };
    
    setFixedCosts([...fixedCosts, cost]);
    setNewCost({ name: '', amount: 0, frequency: 'monthly', category: '' });
    setIsAddingCost(false);
    toast.success('Costo fijo agregado');
  };

  const addSalary = () => {
    if (!newSalary.month || !newSalary.amount || !newSalary.description) {
      toast.error('Completa todos los campos');
      return;
    }
    
    const salary: Salary = {
      id: Date.now().toString(),
      ...newSalary
    };
    
    setSalaries([...salaries, salary]);
    setNewSalary({ month: '', amount: 0, description: '' });
    setIsAddingSalary(false);
    toast.success('Extracción de sueldo registrada');
  };

  const addMovement = () => {
    if (!newMovement.amount || !newMovement.description || !newMovement.date) {
      toast.error('Completa todos los campos');
      return;
    }
    
    const movement: MonetaryMovement = {
      id: Date.now().toString(),
      ...newMovement
    };
    
    setMovements([...movements, movement]);
    setNewMovement({ type: 'income', amount: 0, description: '', date: '' });
    setIsAddingMovement(false);
    toast.success('Movimiento monetario registrado');
  };

  // Funciones para eliminar elementos
  const deleteCost = (id: string) => {
    setFixedCosts(fixedCosts.filter(cost => cost.id !== id));
    toast.success('Costo fijo eliminado');
  };

  const deleteSalary = (id: string) => {
    setSalaries(salaries.filter(salary => salary.id !== id));
    toast.success('Registro de sueldo eliminado');
  };

  const deleteMovement = (id: string) => {
    setMovements(movements.filter(movement => movement.id !== id));
    toast.success('Movimiento monetario eliminado');
  };

  // Funciones para cierre de caja
  const performCashClose = () => {
    // Guardar la fecha actual como fecha anterior (si existe)
    if (lastCashCloseDate) {
      setPreviousCashCloseDate(lastCashCloseDate);
    }
    
    // Resetear datos que corresponden al período mensual
    setFinancialData(prev => ({
      ...prev,
      incomeByProducts: 0,
      monetaryMovements: 0,
      salaryExtractions: 0,
      orderCosts: 0,
      totalCosts: 0,
      totalIncome: 0,
      profit: 0,
      itemsSold: 0,
      conversionRate: 0
    }));
    
    // Actualizar también los datos formateados
    setFormattedData(prev => ({
      ...prev,
      incomeByProducts: "$0",
      monetaryMovements: "$0",
      salaryExtractions: "$0",
      orderCosts: "$0",
      totalCosts: "$0",
      totalIncome: "$0",
      profit: "$0"
    }));
    
    // Limpiar movimientos y salarios del período
    setMovements([]);
    setSalaries([]);
    
    // Guardar fecha del cierre actual
    const currentDate = new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    setLastCashCloseDate(currentDate);
    
    setIsClosingCash(false);
    toast.success('Cierre de caja realizado exitosamente');
  };

  const revertCashClose = () => {
    // Restaurar datos de ejemplo (en un sistema real, estos vendrían de un backup)
    setFinancialData({
      incomeByProducts: 28750,
      monetaryMovements: 5000,
      fixedCosts: 3200,
      salaryExtractions: 2000,
      orderCosts: 8500,
      totalCosts: 13700,
      totalIncome: 33750,
      profit: 20050,
      totalAssets: 45320,
      itemsSold: 156,
      conversionRate: 12.8,
      availableCapital: 15500
    });
    
    // Restaurar también los datos formateados
    setFormattedData({
      incomeByProducts: "$28,750",
      expensesByCategory: "$13,700",
      monetaryMovements: "$5,000",
      fixedCosts: "$3,200",
      salaryExtractions: "$2,000",
      orderCosts: "$8,500",
      totalCosts: "$13,700",
      totalIncome: "$33,750",
      profit: "$20,050",
      totalAssets: "$45,320",
      availableCapital: "$15,500"
    });
    
    // Restaurar movimientos y salarios de ejemplo
    setMovements([
      { id: '1', type: 'income', amount: 5000, description: 'Inversión inicial', date: '2025-06-01' },
      { id: '2', type: 'expense', amount: 300, description: 'Gastos bancarios', date: '2025-06-15' },
      { id: '3', type: 'income', amount: 2000, description: 'Préstamo familiar', date: '2025-05-20' }
    ]);
    
    setSalaries([
      { id: '1', month: 'Junio 2025', amount: 2000, description: 'Sueldo personal' },
      { id: '2', month: 'Mayo 2025', amount: 1800, description: 'Sueldo personal' },
      { id: '3', month: 'Abril 2025', amount: 2200, description: 'Sueldo personal + bonus' }
    ]);
    
    // Restaurar la fecha del cierre anterior (no la actual)
    if (previousCashCloseDate) {
      setLastCashCloseDate(previousCashCloseDate);
      setPreviousCashCloseDate(null); // Limpiar la fecha anterior
    } else {
      // Si no hay fecha anterior, limpiar la fecha actual
      setLastCashCloseDate(null);
    }
    
    setIsRevertingCash(false);
    toast.success('Cierre de caja revertido exitosamente');
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Dashboard Financiero</h1>
        <p className="text-muted-foreground">Panel de control financiero y análisis de rendimiento</p>
        
        {/* Fecha del último cierre */}
        {lastCashCloseDate && (
          <p className="text-sm text-muted-foreground mt-2">
            Último cierre de caja: {lastCashCloseDate}
          </p>
        )}
        
        {/* Botones de Cierre de Caja */}
        <div className="flex justify-center gap-4 mt-4">
          <Button 
            onClick={() => setIsClosingCash(true)}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Realizar Cierre de Caja
          </Button>
          
          <Button 
            onClick={() => setIsRevertingCash(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowUpRight className="h-4 w-4" />
            Revertir Cierre de Caja
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedData.totalIncome}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingreso por Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedData.incomeByProducts}</div>
            <p className="text-xs text-muted-foreground">
              Ventas directas de productos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimientos Monetarios</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedData.monetaryMovements}</div>
            <p className="text-xs text-muted-foreground">
              Ingresos y extracciones manuales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costos Fijos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedData.fixedCosts}</div>
            <p className="text-xs text-muted-foreground">
              Gastos operativos mensuales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Extracción de Sueldos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedData.salaryExtractions}</div>
            <p className="text-xs text-muted-foreground">
              Sueldos extraídos este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costos de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedData.orderCosts}</div>
            <p className="text-xs text-muted-foreground">
              Inversión en nuevo stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costos Totales</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedData.totalCosts}</div>
            <p className="text-xs text-muted-foreground">
              Todos los gastos del período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formattedData.profit}</div>
            <p className="text-xs text-muted-foreground">
              Ingresos - Costos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patrimonio Total</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedData.totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              Valor total del negocio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Vendidos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialData.itemsSold}</div>
            <p className="text-xs text-muted-foreground">
              Productos vendidos este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialData.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Items vendidos sobre pedidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capital Disponible</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedData.availableCapital}</div>
            <p className="text-xs text-muted-foreground">
              Efectivo disponible para inversión
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Categoría</CardTitle>
            <CardDescription>Distribución de ingresos por tipo de producto</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockIncomeByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockIncomeByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendencia Financiera Mensual</CardTitle>
            <CardDescription>Ingresos, gastos y ganancias por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="income" stackId="1" stroke="#8884d8" fill="#8884d8" name="Ingresos" />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Gastos" />
                <Line type="monotone" dataKey="profit" stroke="#ff7300" strokeWidth={3} name="Ganancia" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Product Popularity Analysis */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Análisis de Popularidad de Productos</CardTitle>
              <CardDescription>Rendimiento de productos por ventas, pedidos y vistas</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="sortBy">Ordenar por:</Label>
              <Select value={sortBy} onValueChange={(value: 'sales' | 'orders' | 'views') => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Ventas</SelectItem>
                  <SelectItem value="orders">Pedidos</SelectItem>
                  <SelectItem value="views">Vistas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Ventas</TableHead>
                    <TableHead>Pedidos</TableHead>
                    <TableHead>Vistas</TableHead>
                    <TableHead>Ingresos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>{product.sales}</TableCell>
                      <TableCell>{product.orders}</TableCell>
                      <TableCell>{product.views}</TableCell>
                      <TableCell>${product.revenue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={sortedProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={140} interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" name="Ventas" />
                  <Bar dataKey="orders" fill="#82ca9d" name="Pedidos" />
                  <Bar dataKey="views" fill="#ffc658" name="Vistas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fixed Costs Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Gestión de Costos Fijos</CardTitle>
                <CardDescription>Costos operativos para cálculo preciso de ganancias</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsViewingCostsHistory(true)}>
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Historial
                </Button>
                <Dialog open={isAddingCost} onOpenChange={setIsAddingCost}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Costo Fijo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="costName">Nombre del Costo</Label>
                      <Input
                        id="costName"
                        value={newCost.name}
                        onChange={(e) => setNewCost({ ...newCost, name: e.target.value })}
                        placeholder="Ej: Alquiler, Servicios"
                      />
                    </div>
                    <div>
                      <Label htmlFor="costAmount">Monto</Label>
                      <Input
                        id="costAmount"
                        type="number"
                        value={newCost.amount}
                        onChange={(e) => setNewCost({ ...newCost, amount: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="costFrequency">Frecuencia</Label>
                      <Select value={newCost.frequency} onValueChange={(value) => setNewCost({ ...newCost, frequency: value as 'monthly' | 'yearly' })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensual</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="costCategory">Categoría</Label>
                      <Input
                        id="costCategory"
                        value={newCost.category}
                        onChange={(e) => setNewCost({ ...newCost, category: e.target.value })}
                        placeholder="Ej: Operativo, Tecnología"
                      />
                    </div>
                    <Button onClick={addFixedCost} className="w-full">Agregar</Button>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {fixedCosts.map((cost) => (
                <div key={cost.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{cost.name}</p>
                    <p className="text-xs text-muted-foreground">{cost.category} - {cost.frequency}</p>
                  </div>
                  <p className="font-semibold">${cost.amount}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Salary Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Gestión de Sueldos</CardTitle>
                <CardDescription>Registro de extracciones de sueldo mensuales</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsViewingSalariesHistory(true)}>
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Historial
                </Button>
                <Dialog open={isAddingSalary} onOpenChange={setIsAddingSalary}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Extracción de Sueldo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="salaryMonth">Mes</Label>
                      <Input
                        id="salaryMonth"
                        value={newSalary.month}
                        onChange={(e) => setNewSalary({ ...newSalary, month: e.target.value })}
                        placeholder="Ej: Junio 2025"
                      />
                    </div>
                    <div>
                      <Label htmlFor="salaryAmount">Monto</Label>
                      <Input
                        id="salaryAmount"
                        type="number"
                        value={newSalary.amount}
                        onChange={(e) => setNewSalary({ ...newSalary, amount: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="salaryDescription">Descripción</Label>
                      <Input
                        id="salaryDescription"
                        value={newSalary.description}
                        onChange={(e) => setNewSalary({ ...newSalary, description: e.target.value })}
                        placeholder="Ej: Sueldo personal, Bonus"
                      />
                    </div>
                    <Button onClick={addSalary} className="w-full">Registrar</Button>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {salaries.map((salary) => (
                <div key={salary.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{salary.month}</p>
                    <p className="text-xs text-muted-foreground">{salary.description}</p>
                  </div>
                  <p className="font-semibold">${salary.amount}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monetary Movements Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Movimientos Monetarios</CardTitle>
                <CardDescription>Ingresos de capital externos al negocio</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsViewingMovementsHistory(true)}>
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Historial
                </Button>
                <Dialog open={isAddingMovement} onOpenChange={setIsAddingMovement}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Movimiento Monetario</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="movementType">Tipo</Label>
                      <Select value={newMovement.type} onValueChange={(value) => setNewMovement({ ...newMovement, type: value as 'income' | 'expense' })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Ingreso</SelectItem>
                          <SelectItem value="expense">Gasto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="movementAmount">Monto</Label>
                      <Input
                        id="movementAmount"
                        type="number"
                        value={newMovement.amount}
                        onChange={(e) => setNewMovement({ ...newMovement, amount: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="movementDescription">Descripción</Label>
                      <Input
                        id="movementDescription"
                        value={newMovement.description}
                        onChange={(e) => setNewMovement({ ...newMovement, description: e.target.value })}
                        placeholder="Ej: Inversión inicial, Préstamo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="movementDate">Fecha</Label>
                      <Input
                        id="movementDate"
                        type="date"
                        value={newMovement.date}
                        onChange={(e) => setNewMovement({ ...newMovement, date: e.target.value })}
                      />
                    </div>
                    <Button onClick={addMovement} className="w-full">Registrar</Button>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {movements.map((movement) => (
                <div key={movement.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="flex items-center gap-2">
                      {movement.type === 'income' ? 
                        <ArrowUpRight className="h-3 w-3 text-green-600" /> : 
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                      }
                      <p className="font-medium text-sm">{movement.description}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{movement.date}</p>
                  </div>
                  <p className={`font-semibold ${movement.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    ${movement.amount}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profitability Analysis */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Análisis de Rentabilidad</CardTitle>
              <CardDescription>Margen de ganancia por producto</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="profitSortBy">Ordenar por:</Label>
                <Select value={profitSortBy} onValueChange={(value: 'margin' | 'profit' | 'cost' | 'price') => setProfitSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="margin">Margen</SelectItem>
                    <SelectItem value="profit">Ganancia</SelectItem>
                    <SelectItem value="cost">Costo</SelectItem>
                    <SelectItem value="price">Precio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProfitSortOrder(profitSortOrder === 'desc' ? 'asc' : 'desc')}
              >
                {profitSortOrder === 'desc' ? '↓ Mayor a Menor' : '↑ Menor a Mayor'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Ganancia</TableHead>
                <TableHead>Margen %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProfitabilityProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.model}</TableCell>
                  <TableCell>${product.cost.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell>
                  <TableCell>${product.price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell>
                  <TableCell className="text-green-600 font-semibold">
                    ${product.profit.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.margin >= 200 ? "default" : product.margin >= 100 ? "secondary" : "outline"}>
                      {product.margin.toFixed(2)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stock Orders Analysis */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Análisis de Pedidos (Inversión)</CardTitle>
          <CardDescription>Revisa el historial de pedidos de stock para analizar costos e ingresos potenciales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {stockOrders.map((order) => (
              <Collapsible key={order.id} defaultOpen={false} className="border rounded-lg">
                <CollapsibleTrigger className="w-full p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    {/* Información del pedido a la izquierda */}
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                      <p className="text-sm text-muted-foreground">{order.date}</p>
                    </div>
                    
                    {/* Métricas financieras compactas a la derecha + flecha */}
                    <div className="flex items-center gap-4">
                      <div className="flex gap-6 text-right">
                        <div>
                          <p className="text-xs text-muted-foreground">Costo Total</p>
                          <p className="text-sm font-bold text-red-600">
                            ${order.totalCost.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Ingreso Potencial</p>
                          <p className="text-sm font-bold text-blue-600">
                            ${order.potentialIncome.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Ganancia Potencial</p>
                          <p className="text-sm font-bold text-green-600">
                            ${order.potentialProfit.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Margen</p>
                          <div className="text-sm font-bold">
                            <Badge variant="default" className="text-xs px-2 py-1">
                              {order.margin.toFixed(2)}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform data-[state=open]:rotate-180 flex-shrink-0" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="px-4 pb-4">
                  <div className="pt-4 border-t">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Detalle de Productos</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>Modelo</TableHead>
                          <TableHead>Color</TableHead>
                          <TableHead>Costo</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Cantidad</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.product}</TableCell>
                            <TableCell>{item.model}</TableCell>
                            <TableCell>{item.color}</TableCell>
                            <TableCell>${item.cost.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell>
                            <TableCell>${item.price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell>
                            <TableCell>+{item.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diálogos de Historial */}
      
      {/* Historial de Costos Fijos */}
      <Dialog open={isViewingCostsHistory} onOpenChange={setIsViewingCostsHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historial Completo de Costos Fijos</DialogTitle>
            <DialogDescription>Todos los costos fijos registrados en el sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Frecuencia</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fixedCosts.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell className="font-medium">{cost.name}</TableCell>
                    <TableCell>{cost.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {cost.frequency === 'monthly' ? 'Mensual' : 'Anual'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">${cost.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteCost(cost.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {fixedCosts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay costos fijos registrados
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Historial de Sueldos */}
      <Dialog open={isViewingSalariesHistory} onOpenChange={setIsViewingSalariesHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historial Completo de Sueldos</DialogTitle>
            <DialogDescription>Todas las extracciones de sueldo registradas</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaries.map((salary) => (
                  <TableRow key={salary.id}>
                    <TableCell className="font-medium">{salary.month}</TableCell>
                    <TableCell>{salary.description}</TableCell>
                    <TableCell className="font-semibold text-red-600">
                      ${salary.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteSalary(salary.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {salaries.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay extracciones de sueldo registradas
              </div>
            )}
            <div className="border-t pt-4">
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">
                  Total Extraído: ${salaries.reduce((sum, salary) => sum + salary.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Historial de Movimientos Monetarios */}
      <Dialog open={isViewingMovementsHistory} onOpenChange={setIsViewingMovementsHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historial Completo de Movimientos Monetarios</DialogTitle>
            <DialogDescription>Todos los ingresos y gastos de capital registrados</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>{new Date(movement.date).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {movement.type === 'income' ? 
                          <ArrowUpRight className="h-4 w-4 text-green-600" /> : 
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        }
                        <Badge variant={movement.type === 'income' ? 'default' : 'destructive'}>
                          {movement.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{movement.description}</TableCell>
                    <TableCell className={`font-semibold ${movement.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      ${movement.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteMovement(movement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {movements.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay movimientos monetarios registrados
              </div>
            )}
            <div className="border-t pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Ingresos</p>
                  <p className="text-lg font-bold text-green-600">
                    ${movements
                      .filter(m => m.type === 'income')
                      .reduce((sum, m) => sum + m.amount, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Gastos</p>
                  <p className="text-lg font-bold text-red-600">
                    ${movements
                      .filter(m => m.type === 'expense')
                      .reduce((sum, m) => sum + m.amount, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Balance Neto</p>
                  <p className={`text-lg font-bold ${
                    movements.reduce((sum, m) => sum + (m.type === 'income' ? m.amount : -m.amount), 0) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    ${movements
                      .reduce((sum, m) => sum + (m.type === 'income' ? m.amount : -m.amount), 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación - Cierre de Caja */}
      <Dialog open={isClosingCash} onOpenChange={setIsClosingCash}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Calculator className="h-5 w-5" />
              Confirmar Cierre de Caja
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">¿Estás seguro de que deseas realizar el cierre de caja?</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm font-medium text-yellow-800">Esta acción reseteará:</p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Ingresos por productos</li>
                <li>• Movimientos monetarios</li>
                <li>• Extracción de sueldos</li>
                <li>• Costos de pedidos</li>
                <li>• Items vendidos y tasa de conversión</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Los costos fijos y el patrimonio total se mantendrán intactos.
            </p>
          </div>
          <div className="flex gap-3 mt-6">
            <Button 
              onClick={() => setIsClosingCash(false)}
              variant="outline" 
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={performCashClose}
              variant="destructive" 
              className="flex-1"
            >
              Confirmar Cierre
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación - Revertir Cierre */}
      <Dialog open={isRevertingCash} onOpenChange={setIsRevertingCash}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <ArrowUpRight className="h-5 w-5" />
              Confirmar Reversión
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">¿Estás seguro de que deseas revertir el último cierre de caja?</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-800">Esta acción restaurará:</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Datos financieros del período anterior</li>
                <li>• Movimientos monetarios</li>
                <li>• Registros de sueldos</li>
                <li>• Métricas de ventas</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Los datos actuales serán reemplazados por los del período anterior.
            </p>
          </div>
          <div className="flex gap-3 mt-6">
            <Button 
              onClick={() => setIsRevertingCash(false)}
              variant="outline" 
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={revertCashClose}
              variant="default" 
              className="flex-1"
            >
              Confirmar Reversión
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
