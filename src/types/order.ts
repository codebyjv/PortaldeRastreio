export interface EnrichedOrderItem extends OrderItem {
  orders: Order;
  proposal_approved: boolean;
  proposal_send_date: string;
  proposal_approved_date: string;
  proposal_sent_date: string;
}

export interface OrderItem {
  id: number;
  order_id: string;
  product_description: string;
  quantity?: number | null;
  capacity?: string | null;
  certificate_type?: 'IPEM' | 'RBC' | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  order_date: string;
  status: string;
  cnpj: string;
  total_value: number;
  expected_delivery: string;
  created_at: string;
  expiration_date: string;
  shipping_carrier?: string;      // Nome da transportadora
  tracking_code?: string;         // Código de rastreio
  shipping_method?: 'PAC' | 'Sedex' | string; // Método de envio
  collection_number?: string;     // Número da coleta
  items?: OrderItem[];
}

export interface IpemAssessment {
  id: number;
  created_at: string;
  assessment_date: string;
  notes?: string | null;
}

export interface OrderDocument {
  id: string;
  order_id: string;
  file_name: string;
  original_name: string;
  mime_type: string;
  size: number;
  storage_path: string;
  download_url: string;
  uploaded_at: string;
  expires_at: string;
  is_default: boolean;
  is_archived: boolean;
  category: 'Nota Fiscal' | 'Boleto' | 'Certificado' | 'Manual';
}

export interface StatusTimeline {
  confirmacao: Date;
  preparacao: Date;
  expedicao: Date;
  transito: Date;
  entrega: Date;
  concluido: Date;
}

export interface ActionLog {
  id: number;
  created_at: string;
  user_email: string;
  action: string;
  order_id: string;
  details: object | null;
}

export interface DashboardMetrics {
  total_orders: number;
  pending_orders: number;
  shipped_orders: number;
  average_delivery_time: number;
}

export interface Notification {
  id: number;
  created_at: string;
  message: string;
  order_id: string;
  is_read: boolean;
}