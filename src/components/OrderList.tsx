// components/OrderList.tsx
'use client';

import { Package, Calendar } from 'lucide-react';
import { Order } from '../types/order';

interface OrderListProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  selectedOrderId?: string;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onSelectOrder, selectedOrderId }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Nenhum pedido cadastrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 h-248 overflow-y-auto">
      <h3 className="font-semibold text-lg p-4">Pedidos Cadastrados</h3>
      {orders.map((order) => (
        <div
          key={order.id}
          onClick={() => onSelectOrder(order)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onSelectOrder(order);
            }
          }}
          role="button"
          tabIndex={0}
          className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
            order.id === selectedOrderId
              ? 'border-blue-500 bg-blue-50'
              : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-blue-600">#{order.order_number}</h4>
              <p className="text-sm text-gray-600">{order.customer_name}</p>
              <p className="text-xs text-gray-500">{order.cnpj}</p>
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                order.status === 'Entregue' ? 'bg-green-100 text-green-800' :
                order.status === 'Em Andamento' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'Confirmado' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {order.order_date.toString()}
            </div>
            <div className="font-semibold text-green-600">
              R$ {order.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};