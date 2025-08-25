// components/ExcelImporter.tsx
import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SupabaseService } from '../services/supabaseService';
import * as XLSX from 'xlsx';

interface ExcelImporterProps {
  onImportComplete: () => void;
  onCancel: () => void;
}

interface ImportResult {
  success: number;
  errors: number;
  messages: string[];
}

export const ExcelImporter: React.FC<ExcelImporterProps> = ({ onImportComplete, onCancel }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setImportResult(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      await processERPData(data);
    } catch (error: any) {
      setImportResult({
        success: 0,
        errors: 1,
        messages: [error.message || 'Erro ao processar arquivo Excel']
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processERPData = async (data: any[]) => {
    const results: ImportResult = {
      success: 0,
      errors: 0,
      messages: []
    };
    
    // Padrão regex para identificar linhas de pedido no formato do ERP
    // Exemplo: "4063023 - SAO PAULO BALANCAS E MAQUINAS LTDA - 08.431.807/0001-90 - 20/08/2025"
    const orderPattern = /(\d+)\s*-\s*([^-]+)\s*-\s*([\d.\/]+-?\d*)\s*-\s*(\d{2}\/\d{2}\/\d{4})/;
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Pular linhas vazias ou com poucos dados
      if (!row || row.length < 5) continue;
      
      // Procurar por células que contenham o padrão de pedido
      for (let j = 0; j < row.length; j++) {
        const cellValue = row[j]?.toString().trim();
        
        if (cellValue && orderPattern.test(cellValue)) {
          const match = cellValue.match(orderPattern);
          
          if (match && match.length >= 5) {
            try {
              const orderData = {
                order_number: match[1].trim(),
                customer_name: match[2].trim(),
                cnpj: match[3].trim().replace(/\D/g, ''),
                order_date: convertDate(match[4].trim()),
                status: 'Confirmado',
                total_value: 0,
                expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                created_at: new Date().toISOString(),
                expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              };
              
              // Validar dados obrigatórios
              if (!orderData.order_number || !orderData.customer_name) {
                results.errors++;
                results.messages.push(`Linha ${i + 1}: Número do pedido ou nome do cliente ausente`);
                continue;
              }
              
              await SupabaseService.createOrder(orderData);
              results.success++;
              results.messages.push(`Pedido ${orderData.order_number} importado com sucesso`);
            } catch (error: any) {
              results.errors++;
              results.messages.push(`Erro na linha ${i + 1}: ${error.message}`);
            }
            
            // Pular para a próxima linha após encontrar um pedido
            break;
          }
        }
      }
    }
    
    setImportResult(results);
    if (results.success > 0) {
      onImportComplete();
    }
  };

  // Função para converter datas do formato brasileiro
  const convertDate = (dateString: string): string => {
    try {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        // Formato DD/MM/YYYY para YYYY-MM-DD
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
      }
    } catch (e) {
      console.error('Erro ao converter data:', e);
    }
    return new Date().toISOString();
  };

  const resetImporter = () => {
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Importar Pedidos do ERP
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!importResult ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Arraste um arquivo Excel aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500">
              Formato suportado: Excel (.xlsx)
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".xlsx,.xls"
              className="hidden"
            />
          </div>
        ) : (
          <div className="text-center">
            {importResult.success > 0 ? (
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            ) : (
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            )}
            
            <h3 className="font-semibold text-lg mb-2">
              {importResult.success > 0 ? 'Importação Concluída' : 'Importação com Erros'}
            </h3>
            
            <p className="mb-4">
              {importResult.success} pedido(s) importado(s) com sucesso<br />
              {importResult.errors} erro(s) encontrado(s)
            </p>
            
            {importResult.messages.length > 0 && (
              <div className="bg-gray-100 p-4 rounded-lg max-h-32 overflow-y-auto text-left">
                <h4 className="font-medium mb-2">Detalhes:</h4>
                {importResult.messages.map((message, index) => (
                  <p key={index} className="text-sm text-gray-600">• {message}</p>
                ))}
              </div>
            )}
            
            <div className="flex justify-center gap-4 mt-6">
              <Button onClick={resetImporter}>
                Importar Outro Arquivo
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Fechar
              </Button>
            </div>
          </div>
        )}
        
        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p>Processando arquivo...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};