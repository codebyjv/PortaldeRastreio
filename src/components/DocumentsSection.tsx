import { FileText, Download, File, CreditCard, Truck, BookOpen, Trash2, Eye, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { OrderDocument } from '../types/order';
import { SupabaseService } from '../services/supabaseService';
import { useIsAdminPage } from '../hooks/useIsAdminRoute';
import { useState, useEffect, useCallback } from 'react';
import { FileUpload } from './FileUpload';
import { ConfirmationModal } from './ConfirmationModal';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface DocumentsSectionProps {
  orderId: string;
  orderNumber: string;
  customerName: string;
  onDeleteDocument?: (documentId: string) => void;
}

const DEFAULT_MANUAL = {
  id: "default-manual",
  original_name: "Manual de Uso e Armazenamento de Pesos.pdf",
  download_url:
    "https://nznjfeclykvafgrlapmr.supabase.co/storage/v1/object/public/Manual/Manual%20de%20Uso%20e%20Armazenamento%20de%20Pesos.pdf",
  size: 1024 * 1024, 
  uploaded_at: new Date().toISOString(),
  is_default: true,
  order_id: "",
  file_name: "Manual_de_Uso_e_Armazenamento_de_Pesos",
  mime_type: "application/pdf",
  storage_path: "Manual/Manual de Uso e Armazenamento de Pesos.pdf",
  expires_at: new Date().toISOString(),
  category: 'Manual',
  is_archived: false,
};

export function DocumentsSection({ orderId, onDeleteDocument }: DocumentsSectionProps) {
  const [documents, setDocuments] = useState<OrderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<OrderDocument | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const isAdminRoute = useIsAdminPage();

  const allDocuments = [DEFAULT_MANUAL, ...documents];

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await SupabaseService.getOrderDocuments(orderId, showArchived);
      setDocuments(docs);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId, showArchived]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUploadComplete = () => {
    loadDocuments();
  };

  const getDocumentIcon = (category: string) => {
    switch (category) {
      case 'Nota Fiscal': return <FileText className="w-5 h-5 text-green-600" />;
      case 'Boleto': return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'Certificado': return <Truck className="w-5 h-5 text-orange-600" />;
      case 'Manual': return <BookOpen className="w-5 h-5 text-purple-600" />;
      default: return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDocumentCategoryBadge = (category: string) => {
    const categoryStyles: { [key: string]: string } = {
      'Nota Fiscal': 'bg-green-100 text-green-800',
      'Boleto': 'bg-blue-100 text-blue-800',
      'Certificado': 'bg-orange-100 text-orange-800',
      'Manual': 'bg-purple-100 text-purple-800',
      'Outro': 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge variant="secondary" className={`${categoryStyles[category] || categoryStyles['Outro']} border-0`}>
        {category}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderPreview = () => {
    if (!previewDoc) return null;
    const isImage = previewDoc.mime_type.startsWith('image/');
    const isPdf = previewDoc.mime_type === 'application/pdf';

    return (
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="w-full max-w-6xl h-[90vh] flex flex-col">
          <DialogHeader><DialogTitle>{previewDoc.original_name}</DialogTitle></DialogHeader>
          <div className="flex-grow w-full flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
            {isImage ? (
              <img src={previewDoc.download_url} alt={previewDoc.original_name} className="max-h-full max-w-full object-contain" />
            ) : isPdf ? (
              <iframe src={previewDoc.download_url} className="h-full w-full" title={previewDoc.original_name} />
            ) : (
              <div className="text-center"><File className="w-24 h-24 text-gray-400 mx-auto mb-4" /><p className="text-lg font-medium">Preview não disponível</p><p className="text-gray-500">Este tipo de arquivo não pode ser exibido.</p></div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild><Button variant="outline">Fechar</Button></DialogClose>
            <Button onClick={() => window.open(previewDoc.download_url, '_blank')}><Download className="w-4 h-4 mr-2" />Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
           <FileText className="w-5 h-5 mr-2" />
           <CardTitle>Documentos Disponíveis</CardTitle>
        </div>
        {isAdminRoute && (
            <div className="flex items-center space-x-2">
                <Label htmlFor="archive-switch">Mostrar arquivados</Label>
                <Switch id="archive-switch" checked={showArchived} onCheckedChange={setShowArchived} />
            </div>
        )}
      </CardHeader>
      <CardContent>
        {isAdminRoute && <div className="mb-6"><FileUpload orderId={orderId} onUploadComplete={handleUploadComplete} /></div>}
        {loading ? <p>Carregando...</p> : (
          <div className="space-y-4">
            {allDocuments.map((doc) => (
              <div key={doc.id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${doc.is_archived ? 'bg-gray-100 opacity-70' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center space-x-4 flex-grow">
                  {getDocumentIcon(doc.category || 'Outro')}
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{doc.original_name}</h4>
                      {onDeleteDocument && !doc.is_default && (
                        <Button variant="ghost" size="sm" onClick={() => onDeleteDocument(doc.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50" title="Excluir documento">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      {getDocumentCategoryBadge(doc.category || 'Outro')}
                      {doc.is_archived && <Badge variant="destructive" className="border-0"><Archive className="w-3 h-3 mr-1"/>Arquivado</Badge>}
                      <span className="text-sm text-gray-500">{formatFileSize(doc.size)}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setPreviewDoc(doc as OrderDocument)} className="flex items-center ml-4">
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar
                </Button>
              </div>
            ))}
          </div>
        )}
        {allDocuments.length === 1 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>Nenhum documento disponível para este pedido.</p>
          </div>
        )}
        {renderPreview()}
      </CardContent>
    </Card>
  );
}