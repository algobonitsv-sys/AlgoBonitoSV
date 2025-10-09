"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Crop, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  aspectRatio: '9:16' | '16:9';
  onCrop: (croppedImageUrl: string) => void;
}

export default function ImageCropper({ 
  isOpen, 
  onClose, 
  imageUrl, 
  aspectRatio, 
  onCrop 
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, mouseX: 0, mouseY: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  // Calcular proporción numérica
  const aspectRatioValue = aspectRatio === '9:16' ? 9/16 : 16/9;

  // Verificar si es una URL de Cloudflare R2 (nuestro propio servidor)
  const isCloudflareR2Url = imageUrl && (
    imageUrl.includes('pub-9b9ab0d0c1b54e4592cd963e04de2116.r2.dev') ||
    imageUrl.includes('cloudflare') ||
    imageUrl.includes('r2.dev')
  );

  // Resetear estado cuando se abre el diálogo
  useEffect(() => {
    if (isOpen) {
      console.log('Cropper opened with imageUrl:', imageUrl);
      setImageLoaded(false);
      setImageError(null);
      setIsDragging(false);
      setIsResizing(false);
    }
  }, [isOpen, imageUrl]);

  // Inicializar área de recorte cuando la imagen se carga
  useEffect(() => {
    if (imageLoaded && imageRef.current) {
      const image = imageRef.current;
      const imageWidth = image.clientWidth;
      const imageHeight = image.clientHeight;
      
      setContainerSize({ width: imageWidth, height: imageHeight });
      
      // Calcular tamaño inicial del área de recorte
      const maxWidth = imageWidth * 0.6;
      const maxHeight = imageHeight * 0.6;
      
      let initialWidth, initialHeight;
      
      if (aspectRatio === '9:16') {
        // Para 9:16, la altura será mayor que el ancho
        initialHeight = Math.min(maxHeight, 250);
        initialWidth = initialHeight * aspectRatioValue;
        
        if (initialWidth > maxWidth) {
          initialWidth = maxWidth;
          initialHeight = initialWidth / aspectRatioValue;
        }
      } else {
        // Para 16:9, el ancho será mayor que la altura
        initialWidth = Math.min(maxWidth, 500); // Aumentado de 350 a 500 para mayor calidad
        initialHeight = initialWidth / aspectRatioValue;
        
        if (initialHeight > maxHeight) {
          initialHeight = maxHeight;
          initialWidth = initialHeight * aspectRatioValue;
        }
      }
      
      setCropArea({
        x: (imageWidth - initialWidth) / 2,
        y: (imageHeight - initialHeight) / 2,
        width: initialWidth,
        height: initialHeight
      });
    }
  }, [imageLoaded, aspectRatio, aspectRatioValue]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(null);
  };

  const handleImageError = () => {
    // Verificar si es una URL de Cloudflare R2 (nuestro propio servidor)
    const isCloudflareR2Url = imageUrl && (
      imageUrl.includes('pub-9b9ab0d0c1b54e4592cd963e04de2116.r2.dev') ||
      imageUrl.includes('cloudflare') ||
      imageUrl.includes('r2.dev')
    );

    if (isCloudflareR2Url) {
      // Para URLs de nuestro servidor, no intentar recargar ya que no usamos crossOrigin
      console.log('Cloudflare R2 URL failed to load, but no crossOrigin used');
      setImageError('Error al cargar la imagen desde nuestro servidor. Intenta nuevamente.');
      setImageLoaded(false);
      toast.error('Error al cargar la imagen');
      return;
    }

    // Para otras URLs externas, mostrar error de CORS
    if (imageUrl && !imageUrl.startsWith('blob:') && !isCloudflareR2Url) {
      setImageError('Esta imagen no se puede recortar debido a restricciones de seguridad CORS. Para recortar esta imagen, descárgala primero a tu dispositivo y súbela nuevamente desde tu computadora.');
      setImageLoaded(false);
      toast.error('Error al cargar la imagen (CORS)');
    } else {
      // Para imágenes locales, mostrar mensaje más genérico
      setImageError('Error al cargar la imagen. Intenta nuevamente o sube una imagen diferente.');
      setImageLoaded(false);
      toast.error('Error al cargar la imagen');
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!imageRef.current) return;

    const imageRect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - imageRect.left;
    const y = e.clientY - imageRect.top;

    // Verificar si está en las esquinas para redimensionar (área de 20px)
    const isNearBottomRight = 
      x >= cropArea.x + cropArea.width - 20 && 
      x <= cropArea.x + cropArea.width + 10 &&
      y >= cropArea.y + cropArea.height - 20 && 
      y <= cropArea.y + cropArea.height + 10;

    if (isNearBottomRight) {
      setIsResizing(true);
      setResizeStart({
        width: cropArea.width,
        height: cropArea.height,
        mouseX: x,
        mouseY: y
      });
    } else if (
      x >= cropArea.x && 
      x <= cropArea.x + cropArea.width && 
      y >= cropArea.y && 
      y <= cropArea.y + cropArea.height
    ) {
      // Verificar si está en el área de recorte para mover
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  }, [cropArea]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current) return;

    const imageRect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - imageRect.left;
    const y = e.clientY - imageRect.top;

    if (isResizing) {
      // Calcular nuevo tamaño manteniendo proporción
      const deltaX = x - resizeStart.mouseX;
      const deltaY = y - resizeStart.mouseY;
      
      let newWidth, newHeight;
      
      if (aspectRatio === '9:16') {
        // Para 9:16, usar el cambio en Y como referencia
        newHeight = resizeStart.height + deltaY;
        newWidth = newHeight * aspectRatioValue;
      } else {
        // Para 16:9, usar el cambio en X como referencia
        newWidth = resizeStart.width + deltaX;
        newHeight = newWidth / aspectRatioValue;
      }

      // Limitar tamaño mínimo y máximo
      const minSize = 50;
      const maxWidth = containerSize.width - cropArea.x;
      const maxHeight = containerSize.height - cropArea.y;

      newWidth = Math.max(minSize * aspectRatioValue, Math.min(maxWidth, newWidth));
      newHeight = Math.max(minSize, Math.min(maxHeight, newHeight));

      // Ajustar para mantener proporción exacta
      if (aspectRatio === '9:16') {
        newWidth = newHeight * aspectRatioValue;
      } else {
        newHeight = newWidth / aspectRatioValue;
      }

      setCropArea(prev => ({
        ...prev,
        width: newWidth,
        height: newHeight
      }));
    } else if (isDragging) {
      // Mover el área de recorte
      const newX = x - dragStart.x;
      const newY = y - dragStart.y;

      // Limitar movimiento dentro de los límites de la imagen
      const maxX = containerSize.width - cropArea.width;
      const maxY = containerSize.height - cropArea.height;

      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(maxX, newX)),
        y: Math.max(0, Math.min(maxY, newY))
      }));
    }
  }, [isDragging, isResizing, dragStart, resizeStart, containerSize, cropArea, aspectRatio, aspectRatioValue]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const handleReset = () => {
    if (containerSize.width && containerSize.height) {
      const maxWidth = containerSize.width * 0.6;
      const maxHeight = containerSize.height * 0.6;
      
      let initialWidth, initialHeight;
      
      if (aspectRatio === '9:16') {
        initialHeight = Math.min(maxHeight, 250);
        initialWidth = initialHeight * aspectRatioValue;
        
        if (initialWidth > maxWidth) {
          initialWidth = maxWidth;
          initialHeight = initialWidth / aspectRatioValue;
        }
      } else {
        initialWidth = Math.min(maxWidth, 350);
        initialHeight = initialWidth / aspectRatioValue;
        
        if (initialHeight > maxHeight) {
          initialHeight = maxHeight;
          initialWidth = initialHeight * aspectRatioValue;
        }
      }
      
      setCropArea({
        x: (containerSize.width - initialWidth) / 2,
        y: (containerSize.height - initialHeight) / 2,
        width: initialWidth,
        height: initialHeight
      });
    }
  };

  const handleCrop = async () => {
    if (!imageRef.current || !canvasRef.current) {
      toast.error('Error al procesar la imagen');
      return;
    }

    // Verificar si es una imagen local (blob URL) - no se puede recortar por restricciones de seguridad
    const isBlobUrl = imageUrl && imageUrl.startsWith('blob:');
    console.log('handleCrop called with imageUrl:', imageUrl, 'isBlobUrl:', isBlobUrl);
    if (isBlobUrl) {
      console.log('Blocking crop for blob URL');
      toast.error('Las imágenes cargadas localmente no se pueden recortar por restricciones de seguridad del navegador. Sube la imagen primero y luego recórtala.');
      return;
    }

    // Verificar si es una URL de Cloudflare R2 (permitir recortar)
    const isCloudflareR2Url = imageUrl && (
      imageUrl.includes('pub-9b9ab0d0c1b54e4592cd963e04de2116.r2.dev') ||
      imageUrl.includes('cloudflare') ||
      imageUrl.includes('r2.dev')
    );

    if (imageError && !isCloudflareR2Url) {
      toast.error('No se puede recortar esta imagen debido a restricciones de CORS');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = imageRef.current;
    
    // Calcular la escala entre la imagen mostrada y la imagen real
    const displayWidth = image.clientWidth;
    const displayHeight = image.clientHeight;
    const realWidth = image.naturalWidth;
    const realHeight = image.naturalHeight;
    
    const scaleX = realWidth / displayWidth;
    const scaleY = realHeight / displayHeight;

    // Convertir las coordenadas del área de recorte a las coordenadas reales de la imagen
    const realCropX = cropArea.x * scaleX;
    const realCropY = cropArea.y * scaleY;
    const realCropWidth = cropArea.width * scaleX;
    const realCropHeight = cropArea.height * scaleY;

    // Configurar el canvas con el tamaño del área recortada
    canvas.width = realCropWidth;
    canvas.height = realCropHeight;

    try {
      // Verificación final antes de dibujar en el canvas
      const isBlobUrlFinal = imageUrl && imageUrl.startsWith('blob:');
      if (isBlobUrlFinal) {
        console.error('Detected blob URL at draw time, canvas will be tainted');
        toast.error('Error de seguridad: no se puede procesar imágenes locales');
        return;
      }
      
      // Dibujar la parte recortada de la imagen en el canvas
      ctx.drawImage(
        image,
        realCropX, realCropY, realCropWidth, realCropHeight,
        0, 0, realCropWidth, realCropHeight
      );

      // Comprobar si el canvas quedó contaminado antes de exportar
      try {
        ctx.getImageData(0, 0, 1, 1);
      } catch (taintError) {
        console.warn('Canvas tainted detected after drawImage:', taintError);
        toast.error('No se puede recortar esta imagen por restricciones de seguridad del navegador.');
        return;
      }

      // Convertir el canvas a blob y luego a URL
      try {
        canvas.toBlob((blob) => {
          if (blob) {
            const croppedUrl = URL.createObjectURL(blob);
            onCrop(croppedUrl);
            onClose();
            toast.success('Imagen recortada exitosamente');
          } else {
            // Fallback: usar toDataURL si toBlob falla
            try {
              const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
              onCrop(dataUrl);
              onClose();
              toast.success('Imagen recortada exitosamente');
            } catch (dataUrlError) {
              console.error('Error al generar data URL:', dataUrlError);
              toast.error('Error al generar la imagen recortada');
            }
          }
        }, 'image/jpeg', 0.9);
      } catch (blobError) {
        // Si toBlob falla completamente (CORS), usar toDataURL
        console.warn('toBlob failed, using toDataURL fallback:', blobError);
        
        // Verificación adicional de seguridad antes de usar toDataURL
        const isBlobUrlFallback = imageUrl && imageUrl.startsWith('blob:');
        if (isBlobUrlFallback) {
          console.error('Cannot use toDataURL with tainted canvas from blob URL');
          toast.error('Error al procesar la imagen (restricciones de seguridad)');
          return;
        }
        
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          onCrop(dataUrl);
          onClose();
          toast.success('Imagen recortada exitosamente');
        } catch (dataUrlError) {
          console.error('Error al generar data URL:', dataUrlError);
          toast.error('Error al procesar la imagen (problema de CORS)');
        }
      }
    } catch (error) {
      console.error('Error al recortar imagen:', error);
      toast.error('Error al procesar la imagen');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Recortar Imagen ({aspectRatio})
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Label>Instrucciones:</Label>
            <span>Arrastra el marco para mover • Arrastra la esquina inferior derecha para redimensionar</span>
          </div>
          
          <div 
            ref={containerRef}
            className="relative border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
            style={{ height: '60vh' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {imageUrl && (
              <div className="relative inline-block w-full h-full">
                {imageError ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="text-red-500 mb-4">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-700 mb-2">
                      {imageUrl && imageUrl.startsWith('blob:') ? 'Imagen local no recortable' : (isCloudflareR2Url ? 'Error al cargar la imagen' : 'Imagen no disponible para recortar')}
                    </h3>
                    <p className="text-sm text-gray-600 max-w-md mb-4">
                      {imageUrl && imageUrl.startsWith('blob:') 
                        ? 'Las imágenes cargadas desde tu dispositivo no se pueden recortar directamente por restricciones de seguridad del navegador. Sube la imagen primero y luego podrás recortarla.' 
                        : imageError}
                    </p>
                    {imageUrl && !imageUrl.startsWith('blob:') && !isCloudflareR2Url && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Solución:</strong> Descarga la imagen a tu dispositivo y súbela nuevamente desde tu computadora local.
                        </p>
                      </div>
                    )}
                    {imageUrl && imageUrl.startsWith('blob:') && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Solución:</strong> Sube la imagen al servidor primero (haz clic en "Subir imagen") y luego podrás recortarla.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <img
                      ref={imageRef}
                      src={imageUrl}
                      alt="Imagen a recortar"
                      className="max-w-full max-h-full object-contain block"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      crossOrigin={imageUrl && !imageUrl.startsWith('blob:') ? 'anonymous' : undefined}
                      draggable={false}
                    />
                    {imageLoaded && (
                      <>
                        {/* Overlay oscuro */}
                        <div className="absolute inset-0 bg-black bg-opacity-50" />
                        
                        {/* Área de recorte */}
                        <div
                          className="absolute border-2 border-white shadow-lg cursor-move bg-transparent"
                          style={{
                            left: `${cropArea.x}px`,
                            top: `${cropArea.y}px`,
                            width: `${cropArea.width}px`,
                            height: `${cropArea.height}px`,
                            backgroundImage: `url(${imageUrl})`,
                            backgroundPosition: `-${cropArea.x}px -${cropArea.y}px`,
                            backgroundSize: `${containerSize.width}px ${containerSize.height}px`,
                            backgroundRepeat: 'no-repeat'
                          }}
                          onMouseDown={handleMouseDown}
                        >
                          {/* Líneas de guía */}
                          <div className="absolute inset-0 border border-white border-opacity-50">
                            <div className="absolute top-1/3 left-0 right-0 border-t border-white border-opacity-30" />
                            <div className="absolute top-2/3 left-0 right-0 border-t border-white border-opacity-30" />
                            <div className="absolute left-1/3 top-0 bottom-0 border-l border-white border-opacity-30" />
                            <div className="absolute left-2/3 top-0 bottom-0 border-l border-white border-opacity-30" />
                          </div>
                          
                          {/* Indicador de proporción */}
                          <div className="absolute -top-6 left-0 text-xs text-white bg-black bg-opacity-75 px-2 py-1 rounded">
                            {aspectRatio}
                          </div>
                          
                          {/* Control de redimensionamiento */}
                          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-se-resize hover:bg-blue-100 transition-colors" />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Resetear
            </Button>
            <div className="text-xs text-muted-foreground ml-auto">
              Proporción: {aspectRatio} | Tamaño: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleCrop} disabled={!imageLoaded}>
            <Crop className="h-4 w-4 mr-2" />
            Aplicar Recorte
          </Button>
        </DialogFooter>
        
        {/* Canvas oculto para el procesamiento */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}