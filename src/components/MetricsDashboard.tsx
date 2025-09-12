import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SupabaseService } from '../services/supabaseService';
import { BarChart, Briefcase, Clock, FileWarning } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardMetrics {
  active_orders_count: number;
  pending_documents_count: number;
  deliveries_next_week_count: number;
  orders_by_status: { status: string; count: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

export const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await SupabaseService.getDashboardMetrics();
        setMetrics((data as unknown) as DashboardMetrics);
      } catch (error) {
        console.error('Falha ao carregar métricas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Carregando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return <p className="text-red-500">Não foi possível carregar as métricas.</p>;
  }

  return (
    <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Visão Geral</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border border-green-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pedidos Ativos</CardTitle>
                    <Briefcase className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.active_orders_count}</div>
                    <p className="text-xs text-muted-foreground">Pedidos não finalizados</p>
                </CardContent>
            </Card>
            <Card className="border border-amber-400">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Doc. Pendentes</CardTitle>
                    <FileWarning className="h-4 w-4 text-amber-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.pending_documents_count}</div>
                    <p className="text-xs text-muted-foreground">Pedidos ativos sem documentos</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Entregas da Semana</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.deliveries_next_week_count}</div>
                    <p className="text-xs text-muted-foreground">Entregas nos próximos 7 dias</p>
                </CardContent>
            </Card>
            <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pedidos por Status</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div style={{ width: '100%', height: 120 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={metrics.orders_by_status}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={50}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="status"
                                >
                                    {(metrics.orders_by_status || []).map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value} pedidos`, `${name}`]}/>
                                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
};