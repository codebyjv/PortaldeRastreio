// components/FileUpload.tsx
'use client';

import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
// import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { SupabaseService } from '../services/supabaseService';

interface FileUploadProps {
  orderId: string;
  onUploadComplete: () => void;
}

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
      if (files[i].size > 900 * 1024) {
        setError('Arquivo muito grande. Tamanho máximo: 900KB');
        return;
      }
    }

    setUploading(true);
    setError('');
    
    try {
      for (let i = 0; i < files.length; i++) {
        await SupabaseService.uploadFile(files[i], orderId);
      }
      onUploadComplete();
      alert('Arquivos salvos com sucesso!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
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