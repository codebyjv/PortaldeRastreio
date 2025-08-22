// services/supabaseService.ts
import { supabase } from '../lib/supabase'
import { Order, OrderDocument } from '../types/order'

export const SupabaseService = {
  // ===== CRUD DE PEDIDOS =====
  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'expiration_date'>): Promise<Order> {
    const { data, error } = await supabase
        .from('orders')
        .insert([{
        // Converta camelCase para snake_case
        order_number: orderData.order_number,
        customer_name: orderData.customer_name,
        order_date: orderData.order_date,
        status: orderData.status,
        cnpj: orderData.cnpj,
        total_value: orderData.total_value,
        expected_delivery: orderData.expected_delivery,
        created_at: new Date().toISOString(),
        expiration_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
        }])
        .select()
        .single()

    if (error) throw new Error(`Erro ao criar pedido: ${error.message}`)
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

  async updateOrderStatus(orderId: string, newStatus: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) throw new Error(`Erro ao atualizar status: ${error.message}`)
  },

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select();

    if (error) {
      throw error;
    }

    return data[0];
  },

  async deleteOrder(orderId: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (error) throw new Error(`Erro ao deletar pedido: ${error.message}`)
  },

  // ===== UPLOAD DE ARQUIVOS =====
  async uploadFile(file: File, orderId: string): Promise<OrderDocument> {
    try {
      // 1. Upload para Storage
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Obter URL pública
      const { data: urlData } = supabase
        .storage
        .from('documents')
        .getPublicUrl(fileName)

      // 3. Salvar metadados no banco
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
          expires_at: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
        }])
        .select()
        .single()

      if (dbError) throw dbError
      return dbData

    } catch (error) {
      console.error('Erro no upload:', error)
      if (error instanceof Error) {
        throw new Error(`Falha no upload do arquivo: ${error.message}`)
      } else {
        throw new Error('Falha no upload do arquivo: erro desconhecido')
      }
    }
  },

  // ===== DOWNLOAD DE ARQUIVOS =====
  async getOrderDocuments(orderId: string): Promise<OrderDocument[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('order_id', orderId)
      .order('uploaded_at', { ascending: false })

    if (error) throw new Error(`Erro ao buscar documentos: ${error.message}`)
    return data || []
  },

  async deleteDocument(documentId: string): Promise<void> {
    // Primeiro busca o documento para pegar o caminho do arquivo
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', documentId)
      .single()

    if (fetchError) throw fetchError

    // Deleta do Storage
    const { error: storageError } = await supabase
      .storage
      .from('documents')
      .remove([document.storage_path])

    if (storageError) throw storageError

    // Deleta do banco
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (dbError) throw dbError
  },

  // ===== LIMPEZA AUTOMÁTICA =====
  async cleanupExpiredData(): Promise<void> {
    const now = new Date().toISOString()
    
    // Deleta documentos expirados
    const { error: docsError } = await supabase
      .from('documents')
      .delete()
      .lt('expires_at', now)

    if (docsError) console.error('Erro ao limpar documentos:', docsError)

    // Deleta pedidos expirados
    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .lt('expiration_date', now)

    if (ordersError) console.error('Erro ao limpar pedidos:', ordersError)
  }
}