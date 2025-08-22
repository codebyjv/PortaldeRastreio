'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Order } from '../types/order';
import { SupabaseService } from '../services/supabaseService';

interface EditOrderFormProps {
  order: Order;
  onSave: (updatedOrder: Order) => void;
  onCancel: () => void;
}

export const EditOrderForm: React.FC<EditOrderFormProps> = ({ 
  order, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    total_value: order.total_value,
    expected_delivery: order.expected_delivery.split('T')[0],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedOrder = await SupabaseService.updateOrder(order.id, {
        total_value: Number(formData.total_value),
        expected_delivery: new Date(formData.expected_delivery).toISOString(),
      });

      onSave(updatedOrder);
      alert('Pedido atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      alert('Erro ao atualizar pedido');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Editar Pedido</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="text-sm font-medium">Nova Previsão de Entrega</label>
              <Input
                type="date"
                name="expected_delivery"
                value={formData.expected_delivery}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-600"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
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