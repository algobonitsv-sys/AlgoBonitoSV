'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Loader2, Crop } from 'lucide-react';
import { useFileUpload, FileUploadUtils } from '@/hooks/use-file-upload';
import ImageCropper from '@/components/ui/image-cropper';
import { tempImageStore, TempImageData, TempImageStore } from '@/lib/temp-image-store';
import { toast } from 'sonner';

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
  const manualInputId = useId();
  const [preview, setPreview] = useState<string>(() => {
    if (!currentImageUrl) return '';
    
    // Si es un ID temporal (sin prefijo temp_), obtener la URL del blob
    const tempImage = tempImageStore.getImage(currentImageUrl);
    if (tempImage) {
      return tempImage.previewUrl;
    }
    
    // Si es una URL normal, usarla directamente
    return currentImageUrl;
  });
  const [dragActive, setDragActive] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadFile, deleteFile } = useFileUpload();

  // Efecto para actualizar preview cuando cambie currentImageUrl
  useEffect(() => {
    console.log('🖼️ ImageUpload: currentImageUrl changed:', currentImageUrl);
    
    if (!currentImageUrl) {
      setPreview('');
      setManualUrl('');
      return;
    }
    
    // Clean up any malformed temp IDs with double prefix
    let cleanId = currentImageUrl;
    if (cleanId.startsWith('temp_temp_')) {
      cleanId = cleanId.replace('temp_temp_', '');
      console.log('🧹 ImageUpload: cleaned up malformed ID:', cleanId);
    }
    
    // Primero verificar si es un ID temporal (sin prefijo temp_)
    const tempImage = tempImageStore.getImage(cleanId);
    if (tempImage) {
      console.log('🖼️ ImageUpload: found temp image data:', tempImage);
      setPreview(tempImage.previewUrl);
      console.log('🖼️ ImageUpload: using blob URL:', tempImage.previewUrl);
      setManualUrl('');
    } else {
      // Si no es temporal, usar la URL directamente
      setPreview(currentImageUrl);
      console.log('🖼️ ImageUpload: using regular URL:', currentImageUrl);
      setManualUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleFileSelect = async (file: File) => {
    console.log('🚀 ImageUpload: handleFileSelect started with file:', file.name, file.type, file.size);
    
    // Validar archivo
    const validation = FileUploadUtils.validateFile(file);
    console.log('🔍 ImageUpload: file validation result:', validation);
    if (!validation.valid) {
      console.error('❌ ImageUpload: file validation failed:', validation.error);
      alert(validation.error);
      return;
    }

    // Crear preview inmediatamente usando blob URL
    try {
      console.log('🖼️ ImageUpload: creating image preview...');
      const previewUrl = await FileUploadUtils.createImagePreview(file);
      console.log('✅ ImageUpload: preview URL created:', previewUrl.substring(0, 50) + '...');
      setPreview(previewUrl);

      // Crear datos de imagen temporal
      const tempId = tempImageStore.generateTempId();
      console.log('🆔 ImageUpload: generated temp ID:', tempId);
      
      const tempData: TempImageData = {
        id: tempId,
        file: file,
        previewUrl: previewUrl,
        type: folder?.includes('covers') ? 'cover' : 
              folder?.includes('hover') ? 'hover' : 'gallery'
      };
      console.log('📦 ImageUpload: temp data created:', { ...tempData, file: file.name });

      // Guardar en el almacén temporal
      tempImageStore.addImage(tempData);
      console.log('💾 ImageUpload: temp data saved to store');

      // Notificar al componente padre con solo el ID temporal (sin prefijo)
      console.log('📞 ImageUpload: calling onImageUploaded with tempId:', tempId);
      onImageUploaded(tempId);

      console.log('✅ ImageUpload: handleFileSelect completed successfully');
      setManualUrl('');
      setUrlError('');
    } catch (error) {
      console.error('❌ ImageUpload: error in handleFileSelect:', error);
      alert('Error al crear vista previa de la imagen');
    }
  };

  const handleRemove = async () => {
    if (!currentImageUrl) return;
    
    // Verificar si es un ID temporal (sin prefijo temp_)
    const tempImage = tempImageStore.getImage(currentImageUrl);
    if (tempImage) {
      // Es una imagen temporal, eliminarla del almacén
      tempImageStore.removeImage(currentImageUrl);
      console.log('📁 Imagen temporal eliminada:', currentImageUrl);
    } else {
      // Es una imagen ya subida a R2, intentar eliminarla
      try {
        await deleteFile(currentImageUrl);
      } catch (error) {
        console.warn('Error deleting image from R2:', error);
        // Continuar con la eliminación local aunque falle R2
      }
    }
    
    // Limpiar el preview y notificar al componente padre
    setPreview('');
    setManualUrl('');
    if (onImageRemoved) {
      onImageRemoved();
    }
    
    // Limpiar el input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 ImageUpload: handleInputChange triggered');
    const file = e.target.files?.[0];
    console.log('📄 ImageUpload: selected file:', file ? file.name : 'no file selected');
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

  const validateManualUrl = (value: string) => {
    if (!value.trim()) {
      setUrlError('Ingresa una URL válida');
      return false;
    }

    try {
      const parsed = new URL(value.trim());
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        setUrlError('La URL debe comenzar con http:// o https://');
        return false;
      }
    } catch (error) {
      setUrlError('Formato de URL inválido');
      return false;
    }

    setUrlError('');
    return true;
  };

  const handleUseManualUrl = () => {
    if (!validateManualUrl(manualUrl)) {
      return;
    }

    const cleanedUrl = manualUrl.trim();

    // Si había una imagen temporal previa, eliminarla
    if (currentImageUrl && tempImageStore.getImage(currentImageUrl)) {
      tempImageStore.removeImage(currentImageUrl);
    }

    setPreview(cleanedUrl);
    setManualUrl(cleanedUrl);
    onImageUploaded(cleanedUrl);

    // Limpiar input de archivo físico
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Función para manejar el recorte de imagen
  const handleCropComplete = async (croppedImageUrl: string) => {
    console.log('✂️ ImageUpload: handleCropComplete called with:', croppedImageUrl);
    
    try {
      // Limpiar imagen temporal previa si existe
      if (currentImageUrl && tempImageStore.getImage(currentImageUrl)) {
        tempImageStore.removeImage(currentImageUrl);
        console.log('🗑️ ImageUpload: removed previous temp image:', currentImageUrl);
      }
      
      // Convertir la URL blob cropeada en un File
      console.log('🔄 ImageUpload: converting blob URL to File...');
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      
      // Crear un File desde el blob
      const fileName = `cropped-image-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      console.log('📁 ImageUpload: created File from blob:', file.name, file.size, 'bytes');
      
      // Crear preview URL (que será la misma URL cropeada)
      setPreview(croppedImageUrl);
      
      // Crear datos de imagen temporal
      const tempId = tempImageStore.generateTempId();
      console.log('🆔 ImageUpload: generated temp ID for cropped image:', tempId);
      
      const tempData: TempImageData = {
        id: tempId,
        file: file,
        previewUrl: croppedImageUrl,
        type: folder?.includes('covers') ? 'cover' : 
              folder?.includes('hover') ? 'hover' : 'gallery'
      };
      
      // Guardar en el almacén temporal
      tempImageStore.addImage(tempData);
      console.log('💾 ImageUpload: cropped image saved to temp store');
      
      // Notificar al componente padre con el ID temporal
      console.log('📞 ImageUpload: calling onImageUploaded with tempId:', tempId);
      onImageUploaded(tempId);
      
      // Limpiar input de archivo físico
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setShowCropper(false);
      console.log('✅ ImageUpload: crop complete successfully');
    } catch (error) {
      console.error('❌ ImageUpload: error in handleCropComplete:', error);
      alert('Error al procesar la imagen cropeada');
    }
  };

  // Función para validar si la URL del preview es válida
  const isValidPreviewUrl = (url: string): boolean => {
    if (!url) {
      console.log('❌ Empty URL');
      return false;
    }
    
    console.log('🔍 Validating preview URL:', url);
    
    // Handle data URLs (base64 images)
    if (url.startsWith('data:')) {
      console.log('✅ Valid data URL');
      return true;
    }
    
    // Handle blob URLs
    if (url.startsWith('blob:')) {
      console.log('✅ Valid blob URL');
      return true;
    }
    
    // Handle temp IDs - these are not URLs, they should be converted to blob URLs
    if (TempImageStore.isTempUrl(url)) {
      console.log('⚠️ Temp ID detected, should use blob URL instead');
      return false; // This will force the component to use the blob URL
    }
    
    // Handle HTTP/HTTPS URLs
    try {
      const urlObj = new URL(url);
      const isValid = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      console.log(isValid ? '✅ Valid HTTP/HTTPS URL' : '❌ Invalid URL scheme');
      return isValid;
    } catch (error) {
      console.log('❌ Invalid URL format:', error);
      return false;
    }
  };

  // Función para determinar si se puede recortar la imagen
  const canCropImage = (): boolean => {
    if (!currentImageUrl) return false;
    
    // No permitir recorte de URLs externas (causa error CORS)
    if (currentImageUrl.startsWith('http://') || currentImageUrl.startsWith('https://')) {
      return false;
    }
    
    // Permitir recorte de imágenes locales (blob URLs, data URLs, temp IDs)
    return true;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>
        <ImageIcon className="h-4 w-4 inline mr-2" />
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {preview && isValidPreviewUrl(preview) ? (
        <div className="space-y-4">
          <div className="relative group">
            <div 
              className="relative w-full border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
              style={{ aspectRatio: '9/16' }}
            >
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
            {/* Botones de acción */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              {canCropImage() && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (canCropImage()) {
                      setShowCropper(true);
                    } else {
                      toast.error('No se puede recortar imágenes de URLs externas por restricciones de seguridad');
                    }
                  }}
                  disabled={uploading}
                  className="bg-white/90 hover:bg-white text-gray-700"
                >
                  <Crop className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Área para subir nueva imagen */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Cambiar imagen</Label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-primary hover:bg-gray-50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className={`mx-auto h-8 w-8 mb-2 ${dragActive ? 'text-primary' : 'text-gray-400'}`} />
              <div className="space-y-1">
                <p className="text-xs font-medium">
                  {dragActive ? 'Suelta la imagen aquí' : 'Arrastra una nueva imagen aquí o haz clic para seleccionar'}
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
                  className="mt-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3 w-3 mr-1" />
                      Seleccionar archivo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
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

      <div className="space-y-2">
        <Label htmlFor={manualInputId} className="text-xs text-muted-foreground">
          O pega una URL de imagen
        </Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id={manualInputId}
            placeholder="https://..."
            value={manualUrl}
            onChange={(event) => {
              setManualUrl(event.target.value);
              if (urlError) {
                setUrlError('');
              }
            }}
            disabled={uploading}
          />
          <Button type="button" variant="secondary" onClick={handleUseManualUrl} disabled={uploading}>
            Usar URL
          </Button>
        </div>
        {urlError && <p className="text-xs text-destructive">{urlError}</p>}
      </div>
      
      {/* Modal de recorte */}
      {showCropper && preview && (
        <ImageCropper
          isOpen={showCropper}
          onClose={() => setShowCropper(false)}
          imageUrl={preview}
          aspectRatio="9:16"
          onCrop={handleCropComplete}
        />
      )}
    </div>
  );
}

export default ImageUpload;