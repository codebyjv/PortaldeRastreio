// components/OrderDetails.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Order } from '../types/order';
import { SupabaseService } from '../services/supabaseService';
import { DocumentsSection } from './DocumentsSection';
import { EditOrderForm } from './EditOrderForm';
import { ConfirmationModal } from './ConfirmationModal';
import { OrderInfoCard } from './OrderInfoCard'; // Supondo que refatoramos para um componente separado
import { ActionLogFeed } from './ActionLogFeed';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

interface OrderDetailsProps {
  order: Order;
  onUpdate: () => void;
  onClose: () => void;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onUpdate, onClose }) => {
  const [editing, setEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quando o modo de edição é ativado, sempre volta para a aba de detalhes
  useEffect(() => {
    if (editing) {
      // Lógica para forçar a aba de detalhes se necessário
    }
  }, [editing]);

  const handleSaveEdit = () => {
    onUpdate();
    setEditing(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await SupabaseService.deleteOrder(order.id);
      alert('Pedido excluído com sucesso!');
      onClose();
      onUpdate();
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      alert('Erro ao excluir pedido');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header com botões */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
            <h2 className="text-xl font-bold">Detalhes do Pedido</h2>
            <p className="text-sm text-gray-500">Pedido #{order.order_number}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
            <Edit className="w-4 h-4 mr-1" />
            {editing ? 'Cancelar Edição' : 'Editar'}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setIsDeleteModalOpen(true)} disabled={isDeleting}>
            <Trash2 className="w-4 h-4 mr-1" />
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Se estiver editando, mostra o formulário, senão, mostra as abas */}
      {editing ? (
        <EditOrderForm order={order} onSave={handleSaveEdit} onCancel={() => setEditing(false)} />
      ) : (
        <Tabs defaultValue="details" className="flex-grow flex flex-col">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Detalhes</TabsTrigger>
            <TabsTrigger value="documents" className="flex-1">Documentos</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="flex-grow mt-4">
            <OrderInfoCard order={order} onUpdate={onUpdate} />
          </TabsContent>
          
          <TabsContent value="documents" className="flex-grow mt-4">
            <DocumentsSection orderId={order.id} onDeleteDocument={onUpdate} />
          </TabsContent>

          <TabsContent value="history" className="flex-grow mt-4">
            <ActionLogFeed orderId={order.id} />
          </TabsContent>
        </Tabs>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o pedido ${order.order_number}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
};