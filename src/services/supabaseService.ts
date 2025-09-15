// services/supabaseService.ts
import { supabase } from '../lib/supabase'
import { Order, OrderDocument, ActionLog, DashboardMetrics, Notification, EnrichedOrderItem, IpemAssessment } from '../types/order'

// Helper interno para registrar ações. Não é exportado.
const _logAction = async (action: string, orderId: string | null, details?: object) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    // Não registra a ação se não for um usuário logado (ex: ações automáticas do sistema)
    if (!user) return;

    await supabase.from('action_logs').insert({
      user_email: user.email,
      action: action,
      order_id: orderId,
      details: details || null,
    });
  } catch (error) {
    console.error('Falha ao registrar ação no log:', error);
  }
};

export const SupabaseService = {
  // ===== CRUD DE PEDIDOS =====
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const { items, ...orderFields } = orderData;

    const payload = {
      order_number: orderFields.order_number,
      customer_name: orderFields.customer_name,
      order_date: orderFields.order_date,
      status: orderFields.status || 'Confirmado',
      cnpj: orderFields.cnpj,
      total_value: orderFields.total_value || 0,
      expected_delivery: orderFields.expected_delivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([payload])
        .select()
        .single();

    if (orderError) throw new Error(`Erro ao criar pedido: ${orderError.message}`);
    if (!newOrder) throw new Error('Falha ao criar pedido, nenhum dado retornado.');

    if (items && items.length > 0) {
      const itemsToInsert = items.map(item => ({
        order_id: newOrder.id,
        product_description: item.product_description,
        capacity: item.capacity,
        certificate_type: item.certificate_type,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);

      if (itemsError) {
        console.error(`ATENÇÃO: Pedido ${newOrder.order_number} foi criado, mas falhou ao inserir seus itens.`, itemsError);
      }
    }
    
    await _logAction(`Pedido #${newOrder.order_number} criado com ${items?.length || 0} itens.`, newOrder.id);
    return newOrder;
  },

  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Erro ao buscar pedidos: ${error.message}`)
    return data || []
  },

  async getOrdersByCNPJ(cnpj: string): Promise<Order[]> {
    const cleanCNPJ = cnpj.replace(/\D/g, '')
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('cnpj', cleanCNPJ)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Erro ao buscar pedidos por CNPJ: ${error.message}`)
    return data || []
  },

  async getOrderNumbers(): Promise<Set<string>> {
    const { data, error } = await supabase
      .from('orders')
      .select('order_number');

    if (error) {
      console.error('Erro ao buscar números de pedido:', error);
      return new Set();
    }

    return new Set(data.map(item => item.order_number));
  },

  async updateOrderStatus(orderId: string, newStatus: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) throw new Error(`Erro ao atualizar status: ${error.message}`)
    await _logAction(`Status do pedido alterado para '${newStatus}'.`, orderId);
  },

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select();

    if (error) { throw error; }

    await _logAction(`Detalhes do pedido atualizados.`, orderId, { updatedFields: Object.keys(updates) });
    return data[0];
  },

  async deleteOrder(orderId: string): Promise<void> {
    // Precisamos do número do pedido para o log antes de deletar
    const { data: orderData } = await supabase.from('orders').select('order_number').eq('id', orderId).single();
    const orderNumber = orderData ? orderData.order_number : 'desconhecido';

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (error) throw new Error(`Erro ao deletar pedido: ${error.message}`)
    await _logAction(`Pedido #${orderNumber} excluído.`, orderId);
  },

  // ===== UPLOAD DE ARQUIVOS =====
  async uploadFile(file: File, orderId: string, category: string): Promise<OrderDocument> {
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('documents').upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName);

    const { data: dbData, error: dbError } = await supabase
      .from('documents')
      .insert([{
        order_id: orderId,
        file_name: fileName,
        original_name: file.name,
        mime_type: file.type,
        size: file.size,
        storage_path: uploadData.path,
        download_url: urlData.publicUrl,
        uploaded_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: category
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    await _logAction(`Documento '${file.name}' (${category}) carregado.`, orderId);

    // Atualiza o status do pedido se a categoria for "Nota Fiscal"
    if (category === 'Nota Fiscal') {
      const { error: statusError } = await supabase
        .from('orders')
        .update({ status: 'Faturado' })
        .eq('id', orderId);

      if (statusError) {
        console.error(`Falha ao atualizar status do pedido para 'Faturado' após upload:`, statusError);
      } else {
        await _logAction(`Status do pedido alterado para 'Faturado' automaticamente.`, orderId);
      }
    }

    return dbData;
  },

  // ===== DOWNLOAD DE ARQUIVOS =====
  async getOrderDocuments(orderId: string, includeArchived = false): Promise<OrderDocument[]> {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('order_id', orderId);

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query.order('uploaded_at', { ascending: false });

    if (error) throw new Error(`Erro ao buscar documentos: ${error.message}`)
    return data || []
  },

  async deleteDocument(documentId: string): Promise<void> {
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('storage_path, original_name, order_id')
      .eq('id', documentId)
      .single();

    if (fetchError) throw new Error(`Documento para deletar não encontrado: ${fetchError.message}`);

    const { error: storageError } = await supabase.storage.from('documents').remove([document.storage_path]);
    if (storageError) throw storageError;

    const { error: dbError } = await supabase.from('documents').delete().eq('id', documentId);
    if (dbError) throw dbError;

    await _logAction(`Documento '${document.original_name}' excluído.`, document.order_id);
  },

  // ===== NOTIFICAÇÕES / LEMBRETES =====
  async getUnreadNotifications(): Promise<Notification[]> { // ReminderNotification[]
    const { data, error } = await supabase
      .from('notifications') // Assuming the table is named 'reminders'
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar notificações não lidas:', error);
      return [];
    }
    return data || [];
  },

  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select(); // select() para que o rpc retorne algo

    if (error) {
      console.error(`Erro ao marcar notificação ${notificationId} como lida:`, error);
      return false;
    }
    
    if(data !== null) {
        await _logAction('Notificação marcada como lida', null, { notificationId });
    }

    return data !== null;
  },

  async markAllNotificationsAsRead(): Promise<boolean> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false)
      .select(); // select() para que o rpc retorne algo

    if (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      return false;
    }
    
    if(data !== null) {
        await _logAction('Todas as notificações foram marcadas como lidas', null);
    }

    return data !== null;
  },

  // ===== IPEM & RBC =====
  async getPendingIpemItems(): Promise<EnrichedOrderItem[]> {
    const { data: assessedItems, error: assessedItemsError } = await supabase
      .from('ipem_assessment_items')
      .select('item_id');

    if (assessedItemsError) {
      console.error('Erro ao buscar itens já aferidos:', assessedItemsError);
      return [];
    }
    const assessedItemIds = assessedItems.map(item => item.item_id);

    let query = supabase
      .from('order_items')
      .select('*, orders(*)')
      .eq('certificate_type', 'IPEM');

    if (assessedItemIds.length > 0) {
      query = query.not('id', 'in', `(${assessedItemIds.join(',')})`);
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar itens IPEM pendentes:', error);
      return [];
    }

    return data as EnrichedOrderItem[];
  },

  async getRbcItems(): Promise<EnrichedOrderItem[]> {
    const { data, error } = await supabase
      .from('order_items')
      .select('*, orders(*)')
      .eq('certificate_type', 'RBC')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar itens RBC:', error);
      return [];
    }

    return data as EnrichedOrderItem[];
  },

  async approveRbcProposal(itemIds: number[]): Promise<void> {
    const { error } = await supabase
      .from('order_items')
      .update({ 
        proposal_approved: true,
        proposal_approved_date: new Date().toISOString() 
      })
      .in('id', itemIds);

    if (error) {
      throw new Error(`Erro ao aprovar proposta RBC: ${error.message}`);
    }
    // Assuming order_id is available on the item to log the action
    const { data: item } = await supabase.from('order_items').select('order_id').in('id', itemIds).limit(1).single();
    if (item) {
      await _logAction(`Proposta RBC para ${itemIds.length} itens aprovada.`, item.order_id);
    }
  },

  async rejectRbcProposal(itemIds: number[]): Promise<void> {
    const { error } = await supabase
      .from('order_items')
      .update({ 
        proposal_approved: false,
        proposal_approved_date: new Date().toISOString() 
      })
      .in('id', itemIds);

    if (error) {
      throw new Error(`Erro ao rejeitar proposta RBC: ${error.message}`);
    }
    const { data: item } = await supabase.from('order_items').select('order_id').in('id', itemIds).limit(1).single();
    if (item) {
      await _logAction(`Proposta RBC para ${itemIds.length} itens rejeitada.`, item.order_id);
    }
  },

  async getIpemAssessments(): Promise<IpemAssessment[]> {
    const { data, error } = await supabase
      .from('ipem_assessments')
      .select('*')
      .order('assessment_date', { ascending: false });
    if (error) {
      console.error('Erro ao buscar aferições IPEM:', error);
      return [];
    }
    return data || [];
  },

  async createIpemAssessment(assessmentData: Pick<IpemAssessment, 'assessment_date' | 'notes'>): Promise<IpemAssessment> {
    const { data, error } = await supabase
      .from('ipem_assessments')
      .insert(assessmentData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async addItemsToAssessment(assessmentId: number, itemIds: number[]): Promise<void> {
    const records = itemIds.map(id => ({ assessment_id: assessmentId, item_id: id }));
    const { error } = await supabase.from('ipem_assessment_items').insert(records);
    if (error) throw error;
  },

  async getAssessmentItems(assessmentId: number): Promise<EnrichedOrderItem[]> {
    const { data, error } = await supabase
      .from('ipem_assessment_items')
      .select('order_items(*, orders(*))')
      .eq('assessment_id', assessmentId);

    if (error) {
      console.error(`Erro ao buscar itens para a aferição ${assessmentId}:`, error);
      return [];
    }
    // A estrutura retornada é { order_items: EnrichedOrderItem }[], então precisamos achatar
    return (data.map(item => item.order_items) as unknown) as EnrichedOrderItem[];
  },

  async removeItemFromAssessment(assessmentId: number, itemId: number): Promise<void> {
    const { error } = await supabase
      .from('ipem_assessment_items')
      .delete()
      .eq('assessment_id', assessmentId)
      .eq('item_id', itemId);
    if (error) throw error;
  },

  // ===== DASHBOARD & LOGS =====
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const { data, error } = await supabase.rpc('get_dashboard_metrics');
    if (error) {
      console.error('Erro ao buscar métricas do dashboard:', error);
      throw error;
    }
    return data;
  },

  async getActionLogs(orderId: string): Promise<ActionLog[]> {
    const { data, error } = await supabase
      .from('action_logs')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar logs de ação:', error);
      return [];
    }
    return data;
  }
};