// components/OrderDetails.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, DollarSign, User, FileText, Upload, X, Edit, Hash, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileUpload } from './FileUpload';
import { Order } from '../types/order';
import { SupabaseService } from '../services/supabaseService';
import { DocumentsSection } from './DocumentsSection';
import { TransportSection } from './TransportSection';
import { EditOrderForm } from './EditOrderForm';
import { ConfirmationModal } from './ConfirmationModal';

import { useNotifications } from '../hooks/useNotifications';

interface OrderDetailsProps {
  order: Order;
  onUpdate: () => void;
  onClose: () => void;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onUpdate, onClose }) => {
  const { showOrderNotification, enabled } = useNotifications();
  const [showUpload, setShowUpload] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [localOrder, setLocalOrder] = useState(order);
  const [editing, setEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Atualizar o estado local quando a prop 'order' mudar
  useEffect(() => {
    setLocalOrder(order);
  }, [order]);

  // Carregar documentos do pedido
  useEffect(() => {
    const loadDocuments = async () => {
      if (order.id) {
        try {
          const docs = await SupabaseService.getOrderDocuments(order.id);
          setDocuments(docs);
        } catch (error) {
          console.error('Erro ao carregar documentos:', error);
        } finally {
          setLoadingDocuments(false);
        }
      }
    };

    loadDocuments();
  }, [order.id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      if (order.id) {
        await SupabaseService.updateOrderStatus(order.id, newStatus);

        // Mostrar notificação se estiver habilitado
        if (enabled) {
          showOrderNotification(
            order.order_number,
            order.customer_name,
            'status_changed',
            { 
              type: 'status', 
              priority: 'normal',
              data: { oldStatus: order.status, newStatus }
            }
          );
        }

        onUpdate();
        alert('Status atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmado': return 'bg-blue-100 text-blue-800';
      case 'Em Andamento': return 'bg-yellow-100 text-yellow-800';
      case 'Faturado': return 'bg-purple-100 text-purple-800';
      case 'Despachado': return 'bg-orange-100 text-orange-800';
      case 'Em Transporte': return 'bg-indigo-100 text-indigo-800';
      case 'Entregue': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveEdit = () => {
    onUpdate(); // Recarregar os dados
    setEditing(false); // Fechar o form de edição
  };

  // TODO: Implementar atualização em tempo real do pedido
  // const handleUpdateOrder = (updatedData: Partial<Order>) => {
  //   setLocalOrder({ ...localOrder, ...updatedData });
  //   onUpdate();
  // };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await SupabaseService.deleteOrder(order.id);
      alert('Pedido excluído com sucesso!');
      onClose(); // Fecha o painel de detalhes
      onUpdate(); // Atualiza a lista de pedidos
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      alert('Erro ao excluir pedido');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  return (
  <div className="space-y-4">
    {/* Header com botões */}
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold">Detalhes do Pedido</h2>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditing(!editing)}
          className="flex items-center"
        >
          <Edit className="w-4 h-4 mr-1" />
          {editing ? 'Cancelar Edição' : 'Editar'}
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="flex items-center"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          {isDeleting ? 'Excluindo...' : 'Excluir Pedido'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>

    {/* Form de Edição (aparece apenas quando editing = true) */}
    {editing && (
      <EditOrderForm
        order={order}
        onSave={handleSaveEdit}
        onCancel={() => setEditing(false)}
      />
    )}

    {/* Informações do Pedido (aparece apenas quando editing = false) */}
    {!editing && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Informações do Pedido</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(localOrder.status)}`}>
              {localOrder.status}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-semibold">{localOrder.customer_name}</p>
              </div>
            </div>

            <div className="flex items-center">
              <FileText className="w-5 h-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">CNPJ</p>
                <p className="font-semibold">{localOrder.cnpj}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Data do Pedido</p>
                <p className="font-semibold">
                  {new Date(localOrder.order_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Previsão de Entrega</p>
                <p className="font-semibold">
                  {new Date(localOrder.expected_delivery).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="font-semibold text-green-600">
                  R$ {localOrder.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Hash className="w-5 h-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Número do Pedido</p>
                <p className="font-semibold">{localOrder.order_number}</p>
              </div>
            </div>
          </div>

          {/* Seção de Alteração de Status */}
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Alterar Status</p>
            <div className="flex flex-wrap gap-2">
              {['Confirmado', 'Em Andamento', 'Faturado', 'Despachado', 'Em Transporte', 'Entregue'].map((status) => (
                <Button
                  key={status}
                  variant={localOrder.status === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange(status)}
                  className={localOrder.status === status ? 'bg-blue-500' : ''}
                  disabled={status === localOrder.status}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Nova seção de transporte */}
          <TransportSection order={order} onUpdate={onUpdate} />

        </CardContent>
      </Card>
    )}

    {/* Seção de Documentos (sempre visível) */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Documentos</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center"
            disabled={editing} // Desabilita durante edição
          >
            <Upload className="w-4 h-4 mr-1" />
            {showUpload ? 'Cancelar' : 'Adicionar'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showUpload && order.id && (
          <div className="mb-4">
            <FileUpload
              orderId={order.id}
              onUploadComplete={() => {
                setShowUpload(false);
                onUpdate();
              }}
            />
          </div>
        )}
        
        {/* Lista de Documentos */}
        {loadingDocuments ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Carregando documentos...</p>
          </div>
        ) : documents.length > 0 ? (
          <DocumentsSection 
            orderId={order.id}
            orderNumber={order.order_number}
            customerName={order.customer_name}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>Nenhum documento anexado</p>
            <p className="text-sm text-gray-400 mt-1">
              Use o botão "Adicionar" para incluir documentos
            </p>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Modal de confirmação */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o pedido ${localOrder.order_number}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
  </div>
);
};