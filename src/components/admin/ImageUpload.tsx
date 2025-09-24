'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useFileUpload, FileUploadUtils } from '@/hooks/use-file-upload';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved?: () => void;
  label?: string;
  folder?: string;
  productId?: string;
  required?: boolean;
  className?: string;
}

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  label = 'Imagen',
  folder = 'general',
  productId,
  required = false,
  className = '',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(currentImageUrl || '');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadFile, deleteFile } = useFileUpload();

  const handleFileSelect = async (file: File) => {
    // Validar archivo
    const validation = FileUploadUtils.validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Crear preview inmediatamente
    try {
      const previewUrl = await FileUploadUtils.createImagePreview(file);
      setPreview(previewUrl);
    } catch (error) {
      console.error('Error creating preview:', error);
    }

    // Subir archivo
    const result = await uploadFile(file, { folder, productId });
    if (result.success && result.url) {
      onImageUploaded(result.url);
    } else {
      alert(result.error || 'Error al subir la imagen');
      setPreview(currentImageUrl || '');
    }
  };

  const handleRemove = async () => {
    if (currentImageUrl && onImageRemoved) {
      try {
        await deleteFile(currentImageUrl);
      } catch (error) {
        console.warn('Error deleting image from R2:', error);
        // Continuar con la eliminación local aunque falle R2
      }
      onImageRemoved();
    }
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      alert('Por favor, selecciona solo archivos de imagen');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>
        <ImageIcon className="h-4 w-4 inline mr-2" />
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {preview ? (
        <div className="relative group">
          <div className="relative w-full h-48 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Subiendo...</span>
                </div>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className={`mx-auto h-12 w-12 mb-4 ${dragActive ? 'text-primary' : 'text-gray-400'}`} />
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {dragActive ? 'Suelta la imagen aquí' : 'Arrastra una imagen aquí o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WebP o GIF hasta 5MB
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar archivo
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={uploading}
      />

      <p className="text-xs text-muted-foreground">
        Las imágenes se almacenan de forma segura en Cloudflare R2
      </p>
    </div>
  );
}

export default ImageUpload;