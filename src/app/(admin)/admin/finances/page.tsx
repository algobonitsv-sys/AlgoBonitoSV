
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";

const chartData = [
  { month: "Ene", revenue: 1200 },
  { month: "Feb", revenue: 1800 },
  { month: "Mar", revenue: 1500 },
  { month: "Abr", revenue: 2200 },
  { month: "May", revenue: 2500 },
  { month: "Jun", revenue: 3100 },
  { month: "Jul", revenue: 2900 },
  { month: "Ago", revenue: 3500 },
  { month: "Sep", revenue: 3200 },
  { month: "Oct", revenue: 4100 },
  { month: "Nov", revenue: 4500 },
  { month: "Dic", revenue: 5200 },
];

const recentTransactions = [
  { id: "TRX001", date: "2024-07-28", amount: "$45.00", status: "Completado" },
  { id: "TRX002", date: "2024-07-27", amount: "$35.00", status: "Completado" },
  { id: "TRX003", date: "2024-07-27", amount: "$25.00", status: "Pendiente" },
  { id: "TRX004", date: "2024-07-26", amount: "$40.00", status: "Completado" },
  { id: "TRX005", date: "2024-07-25", amount: "$48.00", status: "Cancelado" },
];

export default function AdminFinancesPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Resumen Financiero</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">+20.1% desde el mes pasado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12,234</div>
                        <p className="text-xs text-muted-foreground">+180.1% desde el mes pasado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Promedio de Pedido</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$38.75</div>
                        <p className="text-xs text-muted-foreground">+2.5% desde el mes pasado</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ingresos Anuales</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--background))",
                                        borderColor: "hsl(var(--border))",
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Ingresos" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Transacciones Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID de Transacción</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTransactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell className="font-medium">{transaction.id}</TableCell>
                                    <TableCell>{transaction.date}</TableCell>
                                    <TableCell>{transaction.amount}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            transaction.status === 'Completado' ? 'bg-green-100 text-green-800' :
                                            transaction.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {transaction.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}
