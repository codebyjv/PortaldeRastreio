import { useState, useEffect } from 'react';
import { Search, Plus, X, Bell, BellOff, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { OrderForm } from './OrderForm';
import { OrderList } from './OrderList';
import { OrderDetails } from './OrderDetails';
import { ExcelImporter } from './ExcelImporter';
import { SupabaseService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import { Order } from '../types/order';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { useNotifications } from '../hooks/useNotifications';
import { Layout } from './Layout';

export const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showImporter, setShowImporter] = useState(false);
  const navigate = useNavigate();

  // Hook de notificações
  const {
    enabled: notificationsEnabled,
    toggleNotifications
  } = useNotifications();

  useEffect(() => {
    checkAuth();
    
    // Ouvir mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/');
        }
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    // Filtrar pedidos baseado no termo de busca
    if (searchTerm.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = orders.filter(order =>
        order.order_number.toLowerCase().includes(term) ||
        order.customer_name.toLowerCase().includes(term) ||
        order.cnpj.includes(term) ||
        order.status.toLowerCase().includes(term)
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  const loadOrders = async () => {
    try {
      const ordersData = await SupabaseService.getOrders();
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      
      // Se o pedido selecionado foi excluído, limpe a seleção
      if (selectedOrder && !ordersData.find(o => o.id === selectedOrder.id)) {
        setSelectedOrder(null);
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
      await loadOrders();
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

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    setLoading(false);
    
    if (!session) {
      navigate('/');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleToggleNotifications = async () => {
    const success = await toggleNotifications();
    if (success) {
      alert('Notificações ativadas com sucesso!');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Carregando pedidos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={handleLogout}>
                Sair
              </Button>
              <Button
                variant={notificationsEnabled ? "default" : "outline"}
                onClick={handleToggleNotifications}
                className="flex items-center gap-2"
              >
                {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                {notificationsEnabled ? 'Notificações Ativas' : 'Ativar Notificações'}
              </Button>
            </div>
              <p className="text-gray-600 mt-1">
                {orders.length} pedido{orders.length !== 1 ? 's' : ''} cadastrado{orders.length !== 1 ? 's' : ''}
              </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowImporter(true)}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Upload className="w-4 h-4" />
              Importar do Excel
            </Button>

            {showImporter && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <ExcelImporter 
                  onImportComplete={() => {
                    setShowImporter(false);
                    loadOrders();
                  }}
                  onCancel={() => setShowImporter(false)}
                />
              </div>
            )}
            
            <Button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'Fechar' : 'Novo Pedido'}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por número, cliente, CNPJ ou status..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-10 bg-white"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">
              {filteredOrders.length} resultado{filteredOrders.length !== 1 ? 's' : ''} encontrado{filteredOrders.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Order Form */}
        {showForm && (
          <OrderForm 
            onSubmit={handleCreateOrder} 
            onCancel={() => setShowForm(false)}
          />
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Order List */}
          <div>
            <div className="bg-white rounded-lg border">
              <OrderList 
                orders={filteredOrders} 
                onSelectOrder={setSelectedOrder}
                selectedOrderId={selectedOrder?.id}
              />
            </div>
          </div>

          {/* Order Details */}
          <div>
            {selectedOrder ? (
              <OrderDetails 
                order={selectedOrder} 
                onUpdate={loadOrders} 
                onClose={() => setSelectedOrder(null)}
              />
            ) : (
              <div className="bg-white rounded-lg border p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="font-semibold text-gray-600 mb-2">
                  Selecione um pedido
                </h3>
                <p className="text-gray-500 text-sm">
                  Clique em um pedido da lista ao lado para visualizar e editar os detalhes
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
