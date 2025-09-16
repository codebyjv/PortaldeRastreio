import { useState, useEffect } from 'react';
import { Search, Plus, X, Upload } from 'lucide-react';
// import { ReminderBell } from './ReminderBell';
import { MetricsDashboard } from './MetricsDashboard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { OrderCalendarView } from './OrderCalendarView';
import { OrderForm } from './OrderForm';
import { OrderList } from './OrderList';
import { OrderDetails } from './OrderDetails';
import { ExcelImporter } from './ExcelImporter';
import { SupabaseService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import { Order } from '../types/order';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Layout } from './Layout';
import { Badge }n from './ui/badge';
import { Pagination } from './ui/pagination'; // Assuming you have a Pagination component

const QUICK_FILTERS = ['Confirmado', 'Em transporte', 'Aguardando retirada', 'Pendente', 'Entregue', 'Cancelado'];

export const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showImporter, setShowImporter] = useState(false);
  const [page, setPage] = useState(1); // New state for current page
  const [totalOrders, setTotalOrders] = useState(0); // New state for total orders
  const navigate = useNavigate();

  // Lógica de autenticação simplificada
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
        navigate('/');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    loadOrders(page); // Call loadOrders with the current page
  }, [page]); // Re-run when page changes

  useEffect(() => {
    // Lógica de filtragem unificada
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = orders.filter(order => {
      const searchMatch = searchTerm.trim() === '' ||
        order.order_number.toLowerCase().includes(lowercasedSearchTerm) ||
        order.customer_name.toLowerCase().includes(lowercasedSearchTerm) ||
        order.cnpj.includes(lowercasedSearchTerm) ||
        order.status.toLowerCase().includes(lowercasedSearchTerm);
      const statusMatch = !statusFilter || order.status === statusFilter;
      return searchMatch && statusMatch;
    });
    setFilteredOrders(filtered);
  }, [searchTerm, orders, statusFilter]);

  const loadOrders = async (currentPage: number) => { // Accept currentPage parameter
    try {
      const { orders: ordersData, count } = await SupabaseService.getOrders(currentPage);
      setOrders(ordersData);
      setTotalOrders(count); // Set total orders
      if (selectedOrder) {
        const updatedSelectedOrder = ordersData.find(o => o.id === selectedOrder.id);
        if (updatedSelectedOrder) {
          setSelectedOrder(updatedSelectedOrder);
        } else {
          setSelectedOrder(null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'expirationDate'>) => {
    try {
      await SupabaseService.createOrder(orderData);
      await loadOrders(1); // Reload first page after creation
      setShowForm(false);
      alert('Pedido criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao criar pedido');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>Carregando...</p>
            </div>
        </div>
    );
  }

  if (!user) { return null; }

  return (
    <Layout>
      <div className="p-6 max-w-8xl mx-auto">
        {/* ===== Page Header ===== */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowImporter(true)} variant="outline"><Upload className="w-4 h-4 mr-2" />Importar</Button>
            {showImporter && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <ExcelImporter onImportComplete={() => { setShowImporter(false); loadOrders(1); }} onCancel={() => setShowImporter(false)} /> {/* Reload first page after import */}
              </div>
            )}
            <Button onClick={() => setShowForm(!showForm)}>{showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}{showForm ? 'Fechar' : 'Novo Pedido'}</Button>
          </div>
        </div>

        <MetricsDashboard />

        {/* Search & Filters */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Buscar por número, cliente, CNPJ ou status..." value={searchTerm} onChange={handleSearchChange} className="pl-10 pr-10 bg-white shadow-sm w-167" />
            {searchTerm && <button onClick={clearSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm font-medium text-gray-600">Filtros:</span>
            <Badge variant={!statusFilter ? 'default' : 'outline'} onClick={() => setStatusFilter(null)} className="cursor-pointer">Todos</Badge>
            {QUICK_FILTERS.map(filter => (
              <Badge key={filter} variant={statusFilter === filter ? 'default' : 'outline'} onClick={() => setStatusFilter(filter)} className="cursor-pointer">{filter}</Badge>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="mb-4">
            <h2 className="text-lg font-semibold">{statusFilter ? `Pedidos: ${statusFilter}` : 'Todos os Pedidos'}</h2>
        </div>

        {showForm && <div className="mb-6"><OrderForm onSubmit={handleCreateOrder} onCancel={() => setShowForm(false)} /></div>}

        <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
          <TabsList className="mb-4 bg-gray-200 p-1 rounded-lg">
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div>
                <div className="bg-white rounded-lg border"><OrderList orders={filteredOrders} onSelectOrder={setSelectedOrder} selectedOrderId={selectedOrder?.id} /></div>
                {/* Pagination component */}
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(totalOrders / 10)} // Assuming 10 items per page
                  onPageChange={setPage}
                />
              </div>
              <div>
                {selectedOrder ? <OrderDetails order={selectedOrder} onUpdate={() => loadOrders(page)} onClose={() => setSelectedOrder(null)} /> : ( // Pass current page to onUpdate
                  <div className="bg-white rounded-lg border p-8 text-center h-full flex flex-col justify-center">
                    <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="font-semibold text-gray-700">Selecione um pedido</h3>
                    <p className="text-gray-500 text-sm">Clique em um pedido da lista para ver os detalhes</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="calendar">
            <OrderCalendarView orders={filteredOrders} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};