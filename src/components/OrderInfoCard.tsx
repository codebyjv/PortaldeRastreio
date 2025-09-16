import { Calendar, DollarSign, User, FileText, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Order } from '../types/order';
import { SupabaseService } from '../services/supabaseService';
import { TransportSection } from './TransportSection';

interface OrderInfoCardProps {
  order: Order;
  onUpdate: () => void;
}

export const OrderInfoCard = ({ order, onUpdate }: OrderInfoCardProps) => {

  const handleStatusChange = async (newStatus: string) => {
    try {
      await SupabaseService.updateOrderStatus(order.id, newStatus);
      onUpdate();
      alert('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmado': return 'bg-blue-100 text-blue-800';
      case 'Preparando': return 'bg-yellow-100 text-yellow-800';
      case 'Em transporte': return 'bg-orange-100 text-orange-800';
      case 'Faturado': return 'bg-purple-100 text-purple-800';
      case 'Despachado': return 'bg-orange-100 text-orange-800';
      case 'Aguardando retirada': return 'bg-indigo-100 text-indigo-800';
      case 'Entregue': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const customerName = order.customer_name || '-';
  const cnpj = order.cnpj || '-';

 return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Informações do Pedido</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <User className="w-5 h-5 text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Cliente</p>
              <p className="font-semibold">{customerName}</p>
            </div>
          </div>

          <div className="flex items-center">
            <FileText className="w-5 h-5 text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">CNPJ</p>
              <p className="font-semibold">{cnpj}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Data do Pedido</p>
              <p className="font-semibold">
                {new Date(order.order_date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Previsão de Entrega</p>
              <p className="font-semibold">
                {new Date(order.expected_delivery).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="font-semibold text-green-600">
                R$ {order.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <Hash className="w-5 h-5 text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Número do Pedido</p>
              <p className="font-semibold">{order.order_number}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-2">Alterar Status</p>
          <div className="flex flex-wrap gap-2">
            {['Confirmado', 'Preparando', 'Em transporte', 'Faturado', 'Despachado', 'Aguardando retirada', 'Entregue', 'Cancelado'].map((status) => (
              <Button
                key={status}
                variant={order.status === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange(status)}
                disabled={status === order.status}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <TransportSection order={order} onUpdate={onUpdate} />
      </CardContent>
    </Card>
  );
};