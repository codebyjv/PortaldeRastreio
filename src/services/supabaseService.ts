// services/supabaseService.ts
import { supabase } from '../lib/supabase'
import { Order, OrderDocument } from '../types/order'

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
  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'expiration_date'>): Promise<Order> {
    const { data, error } = await supabase
        .from('orders')
        .insert([{
        order_number: orderData.order_number,
        customer_name: orderData.customer_name,
        order_date: orderData.order_date,
        status: orderData.status,
        cnpj: orderData.cnpj,
        total_value: orderData.total_value,
        expected_delivery: orderData.expected_delivery,
        created_at: new Date().toISOString(),
        expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }])
        .select()
        .single()

    if (error) throw new Error(`Erro ao criar pedido: ${error.message}`)
    
    await _logAction(`Pedido #${data.order_number} criado.`, data.id);
    return data
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

  // ===== DASHBOARD & LOGS =====
  async getDashboardMetrics(): Promise<any> {
    const { data, error } = await supabase.rpc('get_dashboard_metrics');
    if (error) {
      console.error('Erro ao buscar métricas do dashboard:', error);
      throw error;
    }
    return data;
  },

  async getActionLogs(orderId: string): Promise<any[]> {
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