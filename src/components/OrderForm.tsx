import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Order } from '../types/order';

import { useNotifications } from '../hooks/useNotifications';

interface OrderFormProps {
  onSubmit: (orderData: Omit<Order, 'id' | 'createdAt' | 'expirationDate'>) => void;
  onCancel: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, onCancel }) => {
  const { showOrderNotification, enabled } = useNotifications();
  const [formData, setFormData] = useState({
    order_number: '',
    customer_name: '',
    order_date: new Date().toISOString().split('T')[0],
    status: 'Confirmado',
    cnpj: '',
    total_value: 0,
    expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Limpar formatação do CNPJ
    const cleanCNPJ = formData.cnpj.replace(/\D/g, '');
    
    const orderData = {
      ...formData,
      cnpj: cleanCNPJ, // ← Salvar sem formatação
      orderDate: new Date(formData.order_date).toISOString(),
      expectedDelivery: new Date(formData.expected_delivery).toISOString(),
      totalValue: Number(formData.total_value),
    };

    onSubmit(orderData);

    // Mostrar notificação se estiver habilitado
    if (enabled) {
      showOrderNotification(
        formData.order_number,
        formData.customer_name,
        'created',
        { type: 'order', priority: 'high' }
      );
    }
    
    setFormData({
      order_number: '',
      customer_name: '',
      order_date: new Date().toISOString().split('T')[0],
      status: 'Confirmado',
      cnpj: '',
      total_value: 0,
      expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Novo Pedido</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Número do Pedido</label>
              <Input
                name="order_number"
                value={formData.order_number}
                onChange={handleChange}
                required
                placeholder="Ex: 4057313"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Nome do Cliente</label>
              <Input
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
                placeholder="Ex: Empresa ABC"
              />
            </div>

            <div>
              <label className="text-sm font-medium">CNPJ</label>
              <Input
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                required
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="Confirmado">Confirmado</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Faturado">Faturado</option>
                <option value="Despachado">Despachado</option>
                <option value="Em Transporte">Em Transporte</option>
                <option value="Entregue">Entregue</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Data do Pedido</label>
              <Input
                type="date"
                name="order_date"
                value={formData.order_date}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Previsão de Entrega</label>
              <Input
                type="date"
                name="expected_delivery"
                value={formData.expected_delivery}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Valor Total (R$)</label>
              <Input
                type="number"
                name="total_value"
                value={formData.total_value}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="bg-green-500 hover:bg-green-600">
              Criar Pedido
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};