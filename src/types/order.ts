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
}

export interface StatusTimeline {
  confirmacao: Date;
  preparacao: Date;
  expedicao: Date;
  transito: Date;
  entrega: Date;
  concluido: Date;
}