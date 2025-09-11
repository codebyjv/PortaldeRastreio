import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ChevronsRight, X, CornerRightDown } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SupabaseService } from '../services/supabaseService';
import * as XLSX from 'xlsx';
import { Order, OrderItem } from '../types/order';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface ExcelImporterProps {
  onImportComplete: () => void;
  onCancel: () => void;
}

type ValidationStatus = 'Válido' | 'Inválido' | 'Duplicado';

// O item de preview agora é um pedido completo com seus itens
interface PreviewItem extends Partial<Order> {
  items: Partial<OrderItem>[];
  validationStatus: ValidationStatus;
  validationErrors: string[];
}

interface ImportResult {
  success: number;
  errors: number;
  skipped: number;
}

export const ExcelImporter: React.FC<ExcelImporterProps> = ({ onImportComplete, onCancel }) => {
  const [view, setView] = useState<'upload' | 'preview' | 'result'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewItem[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const existingOrderNumbers = await SupabaseService.getOrderNumbers();
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as string[][];
      
      validateData(data, existingOrderNumbers);
      setView('preview');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
      alert(`Erro ao processar arquivo: ${message}`);
      resetImporter();
    } finally {
      setIsProcessing(false);
    }
  };

  const validateData = (data: string[][], existingOrderNumbers: Set<string>) => {
    const validatedItems: PreviewItem[] = [];
    let currentOrder: PreviewItem | null = null;

    const orderPattern = /^\s*(\d+)\s*-\s*([^-]+?)\s*-\s*([\d./-]+)\s*-\s*(\d{2}\/\d{2}\/\d{4})/;
    const itemPattern = /^\s*(Peso Padrão.*)/;

    for (const row of data) {
      const cellValue = row[0] || ''; // Processar apenas a primeira coluna

      const orderMatch = cellValue.match(orderPattern);
      const itemMatch = cellValue.match(itemPattern);

      if (orderMatch) {
        // Se encontrou um novo pedido, salve o anterior (se existir)
        if (currentOrder) {
          validatedItems.push(currentOrder);
        }

        // Inicia um novo pedido
        const orderNumber = orderMatch[1]?.trim();
        const validationErrors: string[] = [];
        let validationStatus: ValidationStatus = 'Válido';

        if (!orderNumber) {
          validationErrors.push('Nº do pedido ausente.');
          validationStatus = 'Inválido';
        } else if (existingOrderNumbers.has(orderNumber)) {
          validationStatus = 'Duplicado';
          validationErrors.push('Este número de pedido já existe no sistema.');
        }

        currentOrder = {
          order_number: orderNumber,
          customer_name: orderMatch[2]?.trim(),
          cnpj: orderMatch[3]?.trim().replace(/\D/g, ''),
          order_date: convertDate(orderMatch[4]?.trim()),
          items: [],
          validationStatus,
          validationErrors,
        };

      } else if (itemMatch && currentOrder) {
        // Se encontrou um item e está dentro de um pedido
        const description = itemMatch[1].trim();

        const capacityPattern = /Cap\.\s*([^-\s]+)/i;
        const certPattern = /-\s*(IPEM|RBC)/i;

        const capacityMatch = description.match(capacityPattern);
        const certMatch = description.match(certPattern);

        const item: Partial<OrderItem> = {
          product_description: description,
          capacity: capacityMatch ? capacityMatch[1] : null,
          certificate_type: certMatch ? (certMatch[1].toUpperCase() as 'IPEM' | 'RBC') : null,
        };
        currentOrder.items.push(item);
      }
    }

    // Adiciona o último pedido processado
    if (currentOrder) {
      validatedItems.push(currentOrder);
    }

    setPreviewData(validatedItems);
  };

  const handleConfirmImport = async () => {
    setIsProcessing(true);
    const validItems = previewData.filter(item => item.validationStatus === 'Válido');
    let successCount = 0;

    for (const item of validItems) {
      try {
        // A função createOrder precisa ser adaptada para receber os itens
        await SupabaseService.createOrder(item as Order);
        successCount++;
      } catch (error) {
        console.error(`Falha ao importar pedido ${item.order_number}:`, error);
      }
    }

    setImportResult({
      success: successCount,
      errors: validItems.length - successCount,
      skipped: previewData.length - validItems.length,
    });

    setIsProcessing(false);
    setView('result');
    if (successCount > 0) onImportComplete();
  };

  const convertDate = (dateString: string): string => {
    if (!dateString) return '';
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
    }
    return '';
  };

  const resetImporter = () => {
    setView('upload');
    setPreviewData([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderUploadView = () => (
    <div
      role="button"
      tabIndex={0}
      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-gray-300 hover:border-blue-400"
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
    >
      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 mb-2">Arraste um arquivo Excel aqui ou clique para selecionar</p>
      <p className="text-sm text-gray-500">Formato suportado: .xlsx</p>
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".xlsx,.xls" className="hidden" />
    </div>
  );

  const renderPreviewView = () => (
    <div>
      <h4 className="font-medium mb-2">Pré-visualização da Importação</h4>
      <p className="text-sm text-muted-foreground mb-4">{previewData.length} pedidos encontrados. Apenas os itens marcados como &apos;Válido&apos; serão importados.</p>
      <div className="max-h-[60vh] overflow-y-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead>Nº Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Itens</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewData.map((item, index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell>
                    <Badge variant={item.validationStatus === 'Válido' ? 'default' : 'destructive'}>{
                      item.validationStatus
                    }</Badge>
                    {item.validationErrors.length > 0 && <p className="text-xs text-red-600 mt-1">{item.validationErrors.join(', ')}</p>}
                  </TableCell>
                  <TableCell>{item.order_number || '-'}</TableCell>
                  <TableCell>{item.customer_name || '-'}</TableCell>
                  <TableCell>{item.items.length} item(s)</TableCell>
                </TableRow>
                {item.items.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-0">
                      <div className="p-2 bg-slate-50">
                        <Table>
                          <TableBody>
                            {item.items.map((orderItem, itemIndex) => (
                              <TableRow key={itemIndex} className="text-xs">
                                <TableCell className="w-[120px]"></TableCell>
                                <TableCell colSpan={2} className="flex items-center">
                                  <CornerRightDown className="w-4 h-4 mr-2 text-gray-400" />
                                  {orderItem.product_description}
                                </TableCell>
                                <TableCell>
                                  {orderItem.certificate_type && (
                                    <Badge variant={orderItem.certificate_type === 'IPEM' ? 'secondary' : 'outline'}>
                                      {orderItem.certificate_type}
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" onClick={resetImporter}>Cancelar</Button>
        <Button onClick={handleConfirmImport} disabled={isProcessing || !previewData.some(p => p.validationStatus === 'Válido')}>
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronsRight className="mr-2 h-4 w-4"/>}
          Importar Válidos
        </Button>
      </div>
    </div>
  );

  const renderResultView = () => (
    <div className="text-center">
      {importResult && importResult.success > 0 ? (
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
      ) : (
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      )}
      <h3 className="font-semibold text-lg mb-2">Importação Concluída</h3>
      <p className="mb-4">
        {importResult?.success} pedido(s) importado(s) com sucesso.<br />
        {importResult?.skipped} registro(s) ignorado(s) (duplicados ou inválidos).<br />
        {importResult?.errors} erro(s) durante a importação.
      </p>
      <div className="flex justify-center gap-4 mt-6">
        <Button onClick={resetImporter}>Importar Outro Arquivo</Button>
        <Button variant="outline" onClick={onCancel}>Fechar</Button>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          <CardTitle>Importar Pedidos do ERP</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}><X className="h-4 w-4"/></Button>
      </CardHeader>
      <CardContent>
        {isProcessing && view === 'upload' && (
            <div className="text-center p-8">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500 mb-4" />
                <p>Analisando arquivo...</p>
            </div>
        )}
        {!isProcessing && view === 'upload' && renderUploadView()}
        {view === 'preview' && renderPreviewView()}
        {view === 'result' && renderResultView()}
      </CardContent>
    </Card>
  );
};