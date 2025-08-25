import React, { useState, useEffect } from 'react';
import { Truck, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SupabaseService } from '../services/supabaseService';
import { Order } from '../types/order';

interface TransportSectionProps {
  order: Order;
  onUpdate: (updatedData: Partial<Order>) => void;
}

export const TransportSection: React.FC<TransportSectionProps> = ({ order, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    shipping_carrier: order.shipping_carrier || '',
    tracking_code: order.tracking_code || '',
    shipping_method: order.shipping_method || '',
    collection_number: order.collection_number || ''
  });
  const [loading, setLoading] = useState(false);

  // Atualizar o formData quando o order mudar
  useEffect(() => {
    setFormData({
      shipping_carrier: order.shipping_carrier || '',
      tracking_code: order.tracking_code || '',
      shipping_method: order.shipping_method || '',
      collection_number: order.collection_number || ''
    });
  }, [order]);

  const handleSave = async () => {
    setLoading(true);
    try {// Atualizar o pedido no Supabase
      await SupabaseService.updateOrder(order.id, formData);

      // Chamar a função de atualização com os novos dados
      onUpdate(formData);

      setIsEditing(false);
      alert('Informações de transporte atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar informações de transporte:', error);
      alert('Erro ao atualizar informações de transporte');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      shipping_carrier: order.shipping_carrier || '',
      tracking_code: order.tracking_code || '',
      shipping_method: order.shipping_method || '',
      collection_number: order.collection_number || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center">
          <Truck className="w-5 h-5 mr-2" />
          Informações de Transporte
        </h3>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-1" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número da Coleta
            </label>
            <Input
              value={formData.collection_number}
              onChange={(e) => setFormData({ ...formData, collection_number: e.target.value })}
              placeholder="Número da coleta"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transportadora
            </label>
            <Input
              value={formData.shipping_carrier}
              onChange={(e) => setFormData({ ...formData, shipping_carrier: e.target.value })}
              placeholder="Nome da transportadora"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código de Rastreio
            </label>
            <Input
              value={formData.tracking_code}
              onChange={(e) => setFormData({ ...formData, tracking_code: e.target.value })}
              placeholder="Código de rastreio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Envio
            </label>
            <Select
              value={formData.shipping_method}
              onValueChange={(value) => setFormData({ ...formData, shipping_method: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PAC">PAC</SelectItem>
                <SelectItem value="Sedex">Sedex</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p><strong>Número da Coleta:</strong> {order.collection_number || 'Não informado'}</p>
          <p><strong>Transportadora:</strong> {order.shipping_carrier || 'Não informado'}</p>
          <p><strong>Código de Rastreio:</strong> {order.tracking_code || 'Não informado'}</p>
          <p><strong>Método de Envio:</strong> {order.shipping_method || 'Não informado'}</p>
        </div>
      )}
    </div>
  );
};