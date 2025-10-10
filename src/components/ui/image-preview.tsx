'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Link, ImageIcon, Crop } from 'lucide-react';
import { toast } from 'sonner';
import ImageCropper from './image-cropper';

interface ImagePreviewProps {
  value: string;
  onChange: (value: string) => void;
  aspectRatio: '9:16' | '16:9';
  label: string;
  placeholder?: string;
  className?: string;
  onProcessingChange?: (processing: boolean) => void;
}

export default function ImagePreview({
  value,
  onChange,
  aspectRatio,
  label,
  placeholder = "https://ejemplo.com/imagen.jpg",
  className = "",
  onProcessingChange
}: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate aspect ratio classes
  const aspectClasses = aspectRatio === '9:16' 
    ? 'aspect-[9/16]' // Portrait for products
    : 'aspect-[16/9]'; // Landscape for carousel

  const maxWidthClass = aspectRatio === '9:16' 
    ? 'max-w-[200px]' // Más ancho para funcionalidad
    : 'max-w-[500px]'; // Más ancho para carousel landscape - aumentado para mayor calidad

  // Handle URL input change
  const handleUrlChange = (url: string) => {
    setPreviewUrl(url);
    onChange(url);
  };

  // Handle file upload
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validate file size (max 10MB) solo si no es carrusel
    if (aspectRatio !== '16:9' && file.size > 10 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 10MB');
      return;
    }

  setIsLoading(true);
  onProcessingChange?.(true);

    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'carousel'); // or 'products' depending on context

      // Upload to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Use the real uploaded URL
        setPreviewUrl(result.url);
        onChange(result.url);
        toast.success('Imagen cargada correctamente');
      } else {
        // Revert to empty on error
        setPreviewUrl('');
        toast.error(result.error || 'Error al subir la imagen');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setPreviewUrl('');
      toast.error('Error al subir la imagen');
    } finally {
      setIsLoading(false);
      onProcessingChange?.(false);
    }
  };

  // Handle image crop
  const handleCrop = async (croppedImageUrl: string) => {
    console.log('🎨 handleCrop: Starting crop handling with URL:', croppedImageUrl.substring(0, 50) + '...');
    setIsLoading(true);
    onProcessingChange?.(true);

    try {
      // Convert cropped image URL to blob
      let blob: Blob;

      if (croppedImageUrl.startsWith('data:')) {
        console.log('📊 handleCrop: Processing data URL');
        // Handle data URL
        const response = await fetch(croppedImageUrl);
        blob = await response.blob();
        console.log('✅ handleCrop: Data URL converted to blob, size:', blob.size);
      } else if (croppedImageUrl.startsWith('blob:')) {
        console.log('🗂️ handleCrop: Processing blob URL');
        // Handle blob URL
        const response = await fetch(croppedImageUrl);
        blob = await response.blob();
        console.log('✅ handleCrop: Blob URL converted to blob, size:', blob.size);
      } else {
        console.error('❌ handleCrop: Unsupported image URL format:', croppedImageUrl.substring(0, 50));
        throw new Error('Unsupported image URL format');
      }

      // Create file from blob
      const file = new File([blob], `cropped-image-${Date.now()}.jpg`, { type: 'image/jpeg' });
      console.log('📁 handleCrop: Created file:', file.name, 'size:', file.size);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'carousel');

      console.log('🚀 handleCrop: Starting upload to /api/upload...');

      // Upload to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('📊 handleCrop: Upload response:', result);

      if (result.success) {
        console.log('✅ handleCrop: Upload successful, URL:', result.url);
        // Use the real uploaded URL
        setPreviewUrl(result.url);
        onChange(result.url);
        toast.success('Imagen recortada y subida correctamente');
      } else {
        console.error('❌ handleCrop: Upload failed:', result.error);
        toast.error(result.error || 'Error al subir la imagen recortada');
      }
    } catch (error) {
      console.error('❌ handleCrop: Unexpected error:', error);
      toast.error('Error al procesar la imagen recortada');
    } finally {
      setIsLoading(false);
      onProcessingChange?.(false);
    }
  };

  // Clear image
  const clearImage = () => {
    setPreviewUrl('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onProcessingChange?.(false);
  };

  // Handle image load error
  const handleImageError = () => {
    setPreviewUrl('');
    toast.error('Error al cargar la imagen. Verifica la URL.');
  };

  return (
    <div 
      className={`space-y-3 ${className}`}
      style={{ 
        maxWidth: '100%', 
        width: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <Label>{label}</Label>
      
      {/* URL Input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="URL imagen"
            className="pr-8 text-xs h-8"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="px-2 h-8"
        >
          <Upload className="h-3 w-3" />
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Image Preview */}
      <Card className="overflow-hidden">
        <CardContent className="p-3">
          <div className={`${maxWidthClass} mx-auto`}>
            <div className={`${aspectClasses} relative overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 flex items-center justify-center`}>
              {previewUrl ? (
                <div className="relative w-full h-full group">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                    onError={handleImageError}
                  />
                  {/* Overlay with action buttons */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsCropperOpen(true)}
                        className="flex items-center gap-1 h-7 px-2 text-xs"
                      >
                        <Crop className="h-3 w-3" />
                        Recortar
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={clearImage}
                        className="h-7 w-7 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {/* Loading overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-sm font-medium">
                        Subiendo...
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-3">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <div className="text-xs text-muted-foreground mb-1">
                    Vista previa
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {aspectRatio}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info and actions - More compact */}
          <div className="mt-2 text-center">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Link className="h-3 w-3" />
                <span>URL</span>
                <span>o</span>
                <Upload className="h-3 w-3" />
                <span>Archivo</span>
              </div>
              <div>
                JPG, PNG, WebP • 10MB
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Cropper Dialog */}
      <ImageCropper
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        imageUrl={previewUrl}
        aspectRatio={aspectRatio}
        onCrop={handleCrop}
      />
    </div>
  );
}