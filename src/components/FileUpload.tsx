// components/FileUpload.tsx
'use client';

import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { SupabaseService } from '../services/supabaseService';

interface FileUploadProps {
  orderId: string;
  onUploadComplete: () => void;
}

// Função para determinar a categoria com base no nome do arquivo
const getCategoryFromFilename = (filename: string): string => {
  const lowerCaseFilename = filename.toLowerCase();

  if (lowerCaseFilename.includes('nf')) {
    return 'Nota Fiscal';
  }
  if (lowerCaseFilename.includes('n° nf')) {
    return 'Boleto';
  }
  // Regex para wlxxxx/xxxx (ex: wl1234/5678)
  if (/wl\d{4}\/\d{4}/.test(lowerCaseFilename)) {
    return 'Certificado';
  }
  if (lowerCaseFilename.includes('manual')) {
    return 'Manual';
  }
  
  return 'Outro'; // Categoria padrão
};

export const FileUpload: React.FC<FileUploadProps> = ({ 
  orderId, 
  onUploadComplete 
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Validar tamanho antes de enviar
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 10 * 1024 * 1024) { // Limite de 10MB
        setError(`Arquivo "${files[i].name}" é muito grande. Tamanho máximo: 10MB`);
        return;
      }
    }

    setUploading(true);
    setError('');
    
    try {
      let hasFiscalNote = false;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const category = getCategoryFromFilename(file.name);
        if (category === 'Nota Fiscal') {
          hasFiscalNote = true;
        }
        await SupabaseService.uploadFile(file, orderId, category);
      }

      // Se uma nota fiscal foi enviada, atualiza o status do pedido
      if (hasFiscalNote) {
        await SupabaseService.updateOrderStatus(orderId, 'Faturado');
      }

      onUploadComplete();
      alert('Arquivos salvos com sucesso!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
      // Limpar o input de arquivo para permitir o reenvio do mesmo arquivo
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="file-upload"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        />
        
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="font-medium">Arraste arquivos ou clique para selecionar</p>
          <p className="text-sm text-gray-500 mt-1">
            PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Máx. 10MB cada)
          </p>
        </label>

        {uploading && (
          <div className="mt-4">
            <div className="animate-pulse bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              Enviando...
            </div>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-gray-500">
        <p>💡 Dica: Os arquivos ficarão disponíveis para download pelos clientes</p>
        <p>📁 Formatos suportados: PDF, Word, Excel, Imagens</p>
      </div>
    </div>
  );
};