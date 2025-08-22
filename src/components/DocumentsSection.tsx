import { FileText, Download, File, CreditCard, Truck, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { OrderDocument } from '../types/order';
import { SupabaseService } from '../services/supabaseService';
import { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { FileUpload } from './FileUpload';

interface DocumentsSectionProps {
  orderId: string;
  orderNumber: string;
  customerName: string;
}

const DEFAULT_MANUAL = {
  id: "default-manual",
  original_name: "Manual de Uso e Armazenamento de Pesos.pdf",
  download_url:
    "https://nznjfeclykvafgrlapmr.supabase.co/storage/v1/object/public/Manual/Manual%20de%20Uso%20e%20Armazenamento%20de%20Pesos.pdf",
  size: 1024 * 1024, // Tamanho aproximado em bytes (1MB)
  uploaded_at: new Date().toISOString(),
  is_default: true, // Flag para identificar que é um documento padrão
  order_id: "",
  file_name: "Manual_de_Uso_e_Armazenamento_de_Pesos",
  mime_type: "application/pdf",
  storage_path: "Manual/Manual de Uso e Armazenamento de Pesos.pdf",
  expires_at: new Date().toISOString(),
};

export function DocumentsSection({ orderId, orderNumber, customerName }: DocumentsSectionProps) {
  const { showOrderNotification, enabled } = useNotifications();
  const [documents, setDocuments] = useState<OrderDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const allDocuments = [DEFAULT_MANUAL, ...documents];

  useEffect(() => {
    loadDocuments();
  }, [orderId]);

  const loadDocuments = async () => {
    try {
      const docs = await SupabaseService.getOrderDocuments(orderId);
      setDocuments(docs);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    loadDocuments(); // Recarrega a lista de documentos
    
    // Mostrar notificação se estiver habilitado
    if (enabled) {
      showOrderNotification(
        orderNumber,
        customerName,
        'document_added',
        { 
          type: 'document', 
          priority: 'normal'
        }
      );
    }
  };

  const getDocumentIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (fileName.toLowerCase().includes('nota') || fileName.toLowerCase().includes('nf')) {
      return <FileText className="w-5 h-5 text-green-600" />;
    } else if (fileName.toLowerCase().includes('boleto')) {
      return <CreditCard className="w-5 h-5 text-blue-600" />;
    } else if (fileName.toLowerCase().includes('comprovante')) {
      return <Truck className="w-5 h-5 text-orange-600" />;
    } else if (fileName.toLowerCase().includes('manual')) {
      return <BookOpen className="w-5 h-5 text-purple-600" />;
    } else if (ext === 'pdf') {
      return <FileText className="w-5 h-5 text-red-600" />;
    } else {
      return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDocumentTypeBadge = (fileName: string) => {
    let badge: { label: string; color: string };
    
    if (fileName.toLowerCase().includes('nota') || fileName.toLowerCase().includes('nf')) {
      badge = { label: 'Nota Fiscal', color: 'bg-green-100 text-green-800' };
    } else if (fileName.toLowerCase().includes('boleto')) {
      badge = { label: 'Boleto', color: 'bg-blue-100 text-blue-800' };
    } else if (fileName.toLowerCase().includes('comprovante')) {
      badge = { label: 'Comprovante', color: 'bg-orange-100 text-orange-800' };
    } else if (fileName.toLowerCase().includes('manual')) {
      badge = { label: 'Manual', color: 'bg-purple-100 text-purple-800' };
    } else {
      badge = { label: 'Documento', color: 'bg-gray-100 text-gray-800' };
    }
    
    return (
      <Badge variant="secondary" className={`${badge.color} border-0`}>
        {badge.label}
      </Badge>
    );
  };

  const handleDownload = async (document: OrderDocument | typeof DEFAULT_MANUAL) => {
  try {
    // Se for o manual padrão, abrir diretamente a URL
    if ('is_default' in document && document.is_default) {
      window.open(document.download_url, '_blank');
    } else {
      // Para documentos normais, usar a lógica existente
      window.open(document.download_url, '_blank');
    }
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error);
    alert('Erro ao baixar arquivo');
  }
};

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeFromExtension = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'PDF';
      case 'doc':
      case 'docx':
        return 'Word';
      case 'xls':
      case 'xlsx':
        return 'Excel';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'Imagem';
      default:
        return 'Arquivo';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando documentos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Documentos Disponíveis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FileUpload 
          orderId={orderId} 
          onUploadComplete={handleUploadComplete}
        />
        
        <div className="space-y-4 mt-4">
          {allDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                {getDocumentIcon(doc.original_name)}
                <div>
                  <h4 className="font-medium text-gray-900">{doc.original_name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    {getDocumentTypeBadge(doc.original_name)}
                    <Badge variant="outline" className="text-xs">
                      {getFileTypeFromExtension(doc.original_name)}
                    </Badge>
                    <span className="text-sm text-gray-500">{formatFileSize(doc.size)}</span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}
                    </span>
                    {/* Indicador para documentos padrão */}
                    {doc.is_default && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-0">
                        Padrão
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(doc)}
                className="flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          ))}
        </div>
        
        {allDocuments.length === 1 && ( // Apenas o manual padrão
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>Nenhum documento disponível</p>
            <p className="text-sm text-gray-400 mt-1">
              Os documentos aparecerão aqui quando forem adicionados
            </p>
          </div>
        )}

        {documents.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Dica:</strong> Clique em "Download" para baixar os arquivos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}