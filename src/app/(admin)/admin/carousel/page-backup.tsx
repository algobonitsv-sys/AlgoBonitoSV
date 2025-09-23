
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Upload, Image as ImageIcon, Eye, Trash2, Edit, ArrowUp, ArrowDown, Crop, Save, X, Plus, Download } from "lucide-react";
import { toast } from "sonner";
import { api } from '@/lib/api/products';
import type { CarouselImage as DBCarouselImage } from '@/types/database';

// Local interface that maps to database structure
interface LocalCarouselImage {
    id: string;
    image_url: string;
    original_image_url?: string | null;
    title: string;
    description?: string | null;
    alt_text?: string | null;
    is_active: boolean;
    order_index: number;
    link_url?: string | null;
    crop_data?: any;
    created_at: string;
    updated_at: string;
}

interface CropData {
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function AdminCarouselPage() {
    const [images, setImages] = useState<LocalCarouselImage[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [editingImage, setEditingImage] = useState<LocalCarouselImage | null>(null);
    const [croppingImage, setCroppingImage] = useState<LocalCarouselImage | null>(null);
    const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
    const [isDragOver, setIsDragOver] = useState(false);
    
    // Form data
    const [formData, setFormData] = useState({
        url: '',
        title: '',
        description: '',
        alt: '',
        link: '',
        active: true
    });

    // Crop state - New movable and resizable frame system
    const [cropData, setCropData] = useState<CropData>({ x: 50, y: 50, width: 320, height: 180 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string>('');
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const cropContainerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);

    // Load images from Supabase API
    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        setIsLoading(true);
        try {
            const response = await api.carouselImages.getAll();
            if (response.success && response.data) {
                setImages(response.data);
            } else {
                toast.error('Error al cargar las imágenes del carrusel');
            }
        } catch (error) {
            console.error('Error loading carousel images:', error);
            toast.error('Error al cargar las imágenes del carrusel');
        } finally {
            setIsLoading(false);
        }
    };

    // Save images to Supabase (this function is now mostly for refreshing the list)
    const refreshImages = async () => {
        await loadImages();
    };

    // Generate unique ID
    const generateId = () => Math.random().toString(36).substr(2, 9);

    // Reset form
    const resetForm = () => {
        setFormData({
            url: '',
            title: '',
            description: '',
            alt: '',
            link: '',
            active: true
        });
    };

    // Handle file drop
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            toast.error('Solo se permiten archivos de imagen');
            return;
        }

        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({
                    ...prev,
                    url: event.target?.result as string
                }));
                setUploadMethod('file');
            };
            reader.readAsDataURL(file);
        });
    }, []);

    // Handle file input
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Solo se permiten archivos de imagen');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setFormData(prev => ({
                ...prev,
                url: event.target?.result as string
            }));
            setUploadMethod('file');
        };
        reader.readAsDataURL(file);
    };

    // Create new carousel image
    const handleCreate = async () => {
        if (!formData.url || !formData.title) {
            toast.error('URL/imagen y título son obligatorios');
            return;
        }

        try {
            const newCarouselImage = {
                title: formData.title,
                description: formData.description,
                alt_text: formData.alt || formData.title,
                image_url: formData.url,
                original_image_url: formData.url,
                link_url: formData.link,
                is_active: formData.active,
                order_index: images.length + 1
            };

            const response = await api.carouselImages.create(newCarouselImage);
            
            if (response.success) {
                await refreshImages();
                resetForm();
                setIsAddDialogOpen(false);
                toast.success('Imagen agregada al carrusel');
            } else {
                toast.error('Error al crear la imagen');
            }
        } catch (error) {
            console.error('Error creating carousel image:', error);
            toast.error('Error al crear la imagen');
        }
    };

    // Edit image
    const handleEdit = (image: CarouselImage) => {
        setEditingImage(image);
        setFormData({
            url: image.originalUrl,
            title: image.title,
            description: image.description,
            alt: image.alt,
            link: image.link || '',
            active: image.active
        });
        setIsEditDialogOpen(true);
    };

    // Update image
    const handleUpdate = () => {
        if (!editingImage || !formData.title) {
            toast.error('Título es obligatorio');
            return;
        }

        const updatedImages = images.map(img => 
            img.id === editingImage.id 
                ? {
                    ...img,
                    originalUrl: formData.url,
                    url: img.cropData ? img.url : formData.url, // Keep cropped version if exists
                    title: formData.title,
                    description: formData.description,
                    alt: formData.alt || formData.title,
                    active: formData.active,
                    link: formData.link,
                    updatedAt: new Date().toISOString()
                }
                : img
        );

        saveImages(updatedImages);
        resetForm();
        setEditingImage(null);
        setIsEditDialogOpen(false);
        toast.success('Imagen actualizada');
    };

    // Delete image
    const handleDelete = (id: string) => {
        const updatedImages = images.filter(img => img.id !== id);
        // Reorder remaining images
        const reorderedImages = updatedImages.map((img, index) => ({
            ...img,
            order: index + 1
        }));
        saveImages(reorderedImages);
        toast.success('Imagen eliminada');
    };

    // Move image up/down
    const moveImage = (id: string, direction: 'up' | 'down') => {
        const currentIndex = images.findIndex(img => img.id === id);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= images.length) return;

        const newImages = [...images];
        [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];
        
        // Update order numbers
        const reorderedImages = newImages.map((img, index) => ({
            ...img,
            order: index + 1
        }));

        saveImages(reorderedImages);
        toast.success(`Imagen movida ${direction === 'up' ? 'arriba' : 'abajo'}`);
    };

    // Toggle active status
    const toggleActive = (id: string) => {
        const updatedImages = images.map(img =>
            img.id === id ? { ...img, active: !img.active } : img
        );
        saveImages(updatedImages);
        toast.success('Estado actualizado');
    };

    // Start cropping - New movable frame system
    const startCrop = (image: CarouselImage) => {
        setCroppingImage(image);
        // Initialize with center position and 16:9 aspect ratio
        setCropData({ x: 50, y: 50, width: 320, height: 180 });
        setIsCropDialogOpen(true);
    };

    // Handle image load for cropping
    const handleImageLoad = () => {
        if (!imageRef.current) return;
        
        const img = imageRef.current;
        setImageSize({ width: img.offsetWidth, height: img.offsetHeight });
        
        // Set initial crop size based on image size
        const maxWidth = img.offsetWidth * 0.6;
        const maxHeight = img.offsetHeight * 0.6;
        const aspectRatio = 16 / 9;
        
        let width = Math.min(maxWidth, maxHeight * aspectRatio);
        let height = width / aspectRatio;
        
        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }
        
        setCropData({
            x: (img.offsetWidth - width) / 2,
            y: (img.offsetHeight - height) / 2,
            width,
            height
        });
    };

    // Handle crop frame drag and resize
    const handleCropMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        const rect = cropContainerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        setDragStart({
            x: e.clientX - rect.left - cropData.x,
            y: e.clientY - rect.top - cropData.y
        });
    };

    // Handle resize handle mouse down
    const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        setResizeHandle(handle);
        const rect = cropContainerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        setDragStart({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleCropMouseMove = (e: React.MouseEvent) => {
        if (!cropContainerRef.current) return;
        
        const rect = cropContainerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (isResizing) {
            // Handle resizing
            const aspectRatio = 16 / 9;
            let newCropData = { ...cropData };

            switch (resizeHandle) {
                case 'se': // Southeast corner
                    {
                        const newWidth = Math.max(50, mouseX - cropData.x);
                        const newHeight = newWidth / aspectRatio;
                        
                        // Check bounds
                        if (cropData.x + newWidth <= imageSize.width && cropData.y + newHeight <= imageSize.height) {
                            newCropData.width = newWidth;
                            newCropData.height = newHeight;
                        }
                    }
                    break;
                case 'sw': // Southwest corner
                    {
                        const newWidth = Math.max(50, cropData.x + cropData.width - mouseX);
                        const newHeight = newWidth / aspectRatio;
                        const newX = cropData.x + cropData.width - newWidth;
                        
                        // Check bounds
                        if (newX >= 0 && cropData.y + newHeight <= imageSize.height) {
                            newCropData.x = newX;
                            newCropData.width = newWidth;
                            newCropData.height = newHeight;
                        }
                    }
                    break;
                case 'ne': // Northeast corner
                    {
                        const newWidth = Math.max(50, mouseX - cropData.x);
                        const newHeight = newWidth / aspectRatio;
                        const newY = cropData.y + cropData.height - newHeight;
                        
                        // Check bounds
                        if (cropData.x + newWidth <= imageSize.width && newY >= 0) {
                            newCropData.y = newY;
                            newCropData.width = newWidth;
                            newCropData.height = newHeight;
                        }
                    }
                    break;
                case 'nw': // Northwest corner
                    {
                        const newWidth = Math.max(50, cropData.x + cropData.width - mouseX);
                        const newHeight = newWidth / aspectRatio;
                        const newX = cropData.x + cropData.width - newWidth;
                        const newY = cropData.y + cropData.height - newHeight;
                        
                        // Check bounds
                        if (newX >= 0 && newY >= 0) {
                            newCropData.x = newX;
                            newCropData.y = newY;
                            newCropData.width = newWidth;
                            newCropData.height = newHeight;
                        }
                    }
                    break;
                case 'e': // East edge
                    {
                        const newWidth = Math.max(50, mouseX - cropData.x);
                        const newHeight = newWidth / aspectRatio;
                        const newY = cropData.y + (cropData.height - newHeight) / 2;
                        
                        // Check bounds
                        if (cropData.x + newWidth <= imageSize.width && newY >= 0 && newY + newHeight <= imageSize.height) {
                            newCropData.y = newY;
                            newCropData.width = newWidth;
                            newCropData.height = newHeight;
                        }
                    }
                    break;
                case 'w': // West edge
                    {
                        const newWidth = Math.max(50, cropData.x + cropData.width - mouseX);
                        const newHeight = newWidth / aspectRatio;
                        const newX = cropData.x + cropData.width - newWidth;
                        const newY = cropData.y + (cropData.height - newHeight) / 2;
                        
                        // Check bounds
                        if (newX >= 0 && newY >= 0 && newY + newHeight <= imageSize.height) {
                            newCropData.x = newX;
                            newCropData.y = newY;
                            newCropData.width = newWidth;
                            newCropData.height = newHeight;
                        }
                    }
                    break;
                case 'n': // North edge
                    {
                        const newHeight = Math.max(28, cropData.y + cropData.height - mouseY); // Min height for 16:9 with min width 50
                        const newWidth = newHeight * aspectRatio;
                        const newX = cropData.x + (cropData.width - newWidth) / 2;
                        const newY = cropData.y + cropData.height - newHeight;
                        
                        // Check bounds
                        if (newX >= 0 && newX + newWidth <= imageSize.width && newY >= 0) {
                            newCropData.x = newX;
                            newCropData.y = newY;
                            newCropData.width = newWidth;
                            newCropData.height = newHeight;
                        }
                    }
                    break;
                case 's': // South edge
                    {
                        const newHeight = Math.max(28, mouseY - cropData.y);
                        const newWidth = newHeight * aspectRatio;
                        const newX = cropData.x + (cropData.width - newWidth) / 2;
                        
                        // Check bounds
                        if (newX >= 0 && newX + newWidth <= imageSize.width && cropData.y + newHeight <= imageSize.height) {
                            newCropData.x = newX;
                            newCropData.width = newWidth;
                            newCropData.height = newHeight;
                        }
                    }
                    break;
            }

            setCropData(newCropData);
        } else if (isDragging) {
            // Handle dragging
            const newX = mouseX - dragStart.x;
            const newY = mouseY - dragStart.y;
            
            // Keep crop frame within image bounds
            const maxX = imageSize.width - cropData.width;
            const maxY = imageSize.height - cropData.height;
            
            setCropData(prev => ({
                ...prev,
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY))
            }));
        }
    };

    const handleCropMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle('');
    };

    // Apply crop - Fixed version without canvas tainted error
    const applyCrop = async () => {
        if (!croppingImage || !imageRef.current) return;

        try {
            const img = imageRef.current;
            
            // Calculate scale factors between display size and natural size
            const scaleX = img.naturalWidth / img.offsetWidth;
            const scaleY = img.naturalHeight / img.offsetHeight;

            // Create new canvas for cropped image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const cropWidth = cropData.width * scaleX;
            const cropHeight = cropData.height * scaleY;
            
            canvas.width = cropWidth;
            canvas.height = cropHeight;

            // Create a new image element to avoid tainted canvas
            const newImg = new Image();
            newImg.crossOrigin = 'anonymous';
            
            newImg.onload = () => {
                // Draw cropped portion
                ctx.drawImage(
                    newImg,
                    cropData.x * scaleX,
                    cropData.y * scaleY,
                    cropWidth,
                    cropHeight,
                    0,
                    0,
                    cropWidth,
                    cropHeight
                );

                // Convert to data URL
                const croppedUrl = canvas.toDataURL('image/jpeg', 0.9);

                // Update image with cropped version
                const updatedImages = images.map(img =>
                    img.id === croppingImage.id
                        ? {
                            ...img,
                            url: croppedUrl,
                            cropData: {
                                x: cropData.x * scaleX,
                                y: cropData.y * scaleY,
                                width: cropWidth,
                                height: cropHeight
                            },
                            updatedAt: new Date().toISOString()
                        }
                        : img
                );

                saveImages(updatedImages);
                setIsCropDialogOpen(false);
                setCroppingImage(null);
                toast.success('Imagen recortada exitosamente');
            };

            newImg.onerror = () => {
                // Fallback: try with original image directly
                try {
                    ctx.drawImage(
                        img,
                        cropData.x * scaleX,
                        cropData.y * scaleY,
                        cropWidth,
                        cropHeight,
                        0,
                        0,
                        cropWidth,
                        cropHeight
                    );

                    const croppedUrl = canvas.toDataURL('image/jpeg', 0.9);

                    const updatedImages = images.map(imgItem =>
                        imgItem.id === croppingImage.id
                            ? {
                                ...imgItem,
                                url: croppedUrl,
                                cropData: {
                                    x: cropData.x * scaleX,
                                    y: cropData.y * scaleY,
                                    width: cropWidth,
                                    height: cropHeight
                                },
                                updatedAt: new Date().toISOString()
                            }
                            : imgItem
                    );

                    saveImages(updatedImages);
                    setIsCropDialogOpen(false);
                    setCroppingImage(null);
                    toast.success('Imagen recortada exitosamente');
                } catch (error) {
                    console.error('Error cropping image:', error);
                    toast.error('Error al recortar la imagen. Intenta con otra imagen.');
                }
            };

            // Set source - for external URLs, this might cause CORS issues
            if (croppingImage.originalUrl.startsWith('data:')) {
                newImg.src = croppingImage.originalUrl;
            } else {
                // For external URLs, try direct approach
                newImg.src = croppingImage.originalUrl;
            }

        } catch (error) {
            console.error('Error cropping image:', error);
            toast.error('Error al recortar la imagen. Intenta con otra imagen.');
        }
    };

    // Statistics
    const stats = {
        total: images.length,
        active: images.filter(img => img.active).length,
        inactive: images.filter(img => !img.active).length
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Administrar Carrusel</h1>
                    <p className="text-muted-foreground">
                        Gestiona las imágenes del carrusel de la página principal
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={isPreviewMode ? "default" : "outline"}
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        {isPreviewMode ? "Modo Edición" : "Vista Previa"}
                    </Button>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Imagen
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Agregar Nueva Imagen</DialogTitle>
                                <DialogDescription>
                                    Sube una imagen desde URL o desde tu dispositivo
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as 'url' | 'file')}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="url">Desde URL</TabsTrigger>
                                        <TabsTrigger value="file">Desde Dispositivo</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="url" className="space-y-4">
                                        <div>
                                            <Label htmlFor="imageUrl">URL de la Imagen</Label>
                                            <Input
                                                id="imageUrl"
                                                placeholder="https://ejemplo.com/imagen.jpg"
                                                value={formData.url}
                                                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                                            />
                                        </div>
                                        {formData.url && (
                                            <div className="border rounded-lg p-4">
                                                <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
                                                <img 
                                                    src={formData.url} 
                                                    alt="Preview" 
                                                    className="max-h-48 w-auto mx-auto rounded-lg"
                                                    onError={() => toast.error('Error al cargar la imagen')}
                                                />
                                            </div>
                                        )}
                                    </TabsContent>
                                    
                                    <TabsContent value="file" className="space-y-4">
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                                isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                                            }`}
                                            onDrop={handleDrop}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                setIsDragOver(true);
                                            }}
                                            onDragLeave={() => setIsDragOver(false)}
                                        >
                                            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                                            <p className="text-lg mb-2">Arrastra una imagen aquí</p>
                                            <p className="text-sm text-muted-foreground mb-4">O haz clic para seleccionar</p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                Seleccionar Archivo
                                            </Button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileInput}
                                            />
                                        </div>
                                        {formData.url && uploadMethod === 'file' && (
                                            <div className="border rounded-lg p-4">
                                                <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
                                                <img 
                                                    src={formData.url} 
                                                    alt="Preview" 
                                                    className="max-h-48 w-auto mx-auto rounded-lg"
                                                />
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="title">Título *</Label>
                                        <Input
                                            id="title"
                                            placeholder="Título de la imagen"
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="alt">Texto Alternativo</Label>
                                        <Input
                                            id="alt"
                                            placeholder="Descripción para accesibilidad"
                                            value={formData.alt}
                                            onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Descripción</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Descripción de la imagen (opcional)"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="link">Enlace (opcional)</Label>
                                    <Input
                                        id="link"
                                        placeholder="URL de destino cuando se hace clic"
                                        value={formData.link}
                                        onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="active"
                                        checked={formData.active}
                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                                    />
                                    <Label htmlFor="active">Activa (visible en el carrusel)</Label>
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleCreate}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Imágenes</CardTitle>
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Imágenes Activas</CardTitle>
                        <Badge variant="default" className="text-xs">Activas</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Imágenes Inactivas</CardTitle>
                        <Badge variant="secondary" className="text-xs">Inactivas</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.inactive}</div>
                    </CardContent>
                </Card>
            </div>

            {isPreviewMode ? (
                /* Preview Mode */
                <Card>
                    <CardHeader>
                        <CardTitle>Vista Previa del Carrusel</CardTitle>
                        <CardDescription>
                            Así se verá el carrusel en tu sitio web
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {images.filter(img => img.active).length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <ImageIcon className="h-12 w-12 mx-auto mb-4" />
                                <p>No hay imágenes activas en el carrusel</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {images
                                    .filter(img => img.active)
                                    .sort((a, b) => a.order - b.order)
                                    .map((image) => (
                                        <div key={image.id} className="border rounded-lg overflow-hidden">
                                            <div className="aspect-video relative">
                                                <img
                                                    src={image.url}
                                                    alt={image.alt}
                                                    className="w-full h-full object-cover"
                                                />
                                                {image.link && (
                                                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                                                        Enlace: {image.link}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-lg">{image.title}</h3>
                                                {image.description && (
                                                    <p className="text-muted-foreground mt-1">{image.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                /* Management Mode */
                <Card>
                    <CardHeader>
                        <CardTitle>Imágenes del Carrusel</CardTitle>
                        <CardDescription>
                            Gestiona las imágenes, su orden y estado de activación
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {images.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <ImageIcon className="h-12 w-12 mx-auto mb-4" />
                                <p className="text-lg mb-2">No hay imágenes en el carrusel</p>
                                <p>Agrega tu primera imagen para comenzar</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16">Orden</TableHead>
                                        <TableHead className="w-24">Imagen</TableHead>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead className="w-20">Estado</TableHead>
                                        <TableHead className="w-32">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {images
                                        .sort((a, b) => a.order - b.order)
                                        .map((image, index) => (
                                            <TableRow key={image.id}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => moveImage(image.id, 'up')}
                                                            disabled={index === 0}
                                                        >
                                                            <ArrowUp className="h-3 w-3" />
                                                        </Button>
                                                        <span className="text-sm font-mono">{image.order}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => moveImage(image.id, 'down')}
                                                            disabled={index === images.length - 1}
                                                        >
                                                            <ArrowDown className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <img
                                                        src={image.url}
                                                        alt={image.alt}
                                                        className="w-16 h-10 object-cover rounded"
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{image.title}</TableCell>
                                                <TableCell>
                                                    <div className="max-w-xs">
                                                        {image.description ? (
                                                            <span className="text-sm text-muted-foreground line-clamp-2">
                                                                {image.description}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground italic">
                                                                Sin descripción
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={image.active ? "default" : "secondary"}>
                                                        {image.active ? "Activa" : "Inactiva"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleActive(image.id)}
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => startCrop(image)}
                                                        >
                                                            <Crop className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(image)}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(image.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Editar Imagen</DialogTitle>
                        <DialogDescription>
                            Modifica la información de la imagen
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="editImageUrl">URL de la Imagen</Label>
                            <Input
                                id="editImageUrl"
                                placeholder="https://ejemplo.com/imagen.jpg"
                                value={formData.url}
                                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                            />
                        </div>

                        {formData.url && (
                            <div className="border rounded-lg p-4">
                                <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
                                <img 
                                    src={formData.url} 
                                    alt="Preview" 
                                    className="max-h-48 w-auto mx-auto rounded-lg"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="editTitle">Título *</Label>
                                <Input
                                    id="editTitle"
                                    placeholder="Título de la imagen"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="editAlt">Texto Alternativo</Label>
                                <Input
                                    id="editAlt"
                                    placeholder="Descripción para accesibilidad"
                                    value={formData.alt}
                                    onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="editDescription">Descripción</Label>
                            <Textarea
                                id="editDescription"
                                placeholder="Descripción de la imagen (opcional)"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="editLink">Enlace (opcional)</Label>
                            <Input
                                id="editLink"
                                placeholder="URL de destino cuando se hace clic"
                                value={formData.link}
                                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="editActive"
                                checked={formData.active}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                            />
                            <Label htmlFor="editActive">Activa (visible en el carrusel)</Label>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleUpdate}>
                                <Save className="h-4 w-4 mr-2" />
                                Actualizar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Crop Dialog - New movable frame system */}
            <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Recortar Imagen (16:9)</DialogTitle>
                        <DialogDescription>
                            Arrastra el marco para moverlo o usa las esquinas/bordes para redimensionarlo. Mantiene la proporción 16:9.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {croppingImage && (
                            <div 
                                ref={cropContainerRef}
                                className="relative max-w-full max-h-96 overflow-hidden border"
                                onMouseMove={handleCropMouseMove}
                                onMouseUp={handleCropMouseUp}
                                onMouseLeave={handleCropMouseUp}
                            >
                                <img
                                    ref={imageRef}
                                    src={croppingImage.originalUrl}
                                    alt="Imagen a recortar"
                                    className="max-w-full max-h-96 object-contain"
                                    onLoad={handleImageLoad}
                                    draggable={false}
                                />
                                
                                {/* Crop frame overlay with resize handles */}
                                <div
                                    className="absolute border-2 border-red-500 bg-red-500/10 cursor-move select-none"
                                    style={{
                                        left: `${cropData.x}px`,
                                        top: `${cropData.y}px`,
                                        width: `${cropData.width}px`,
                                        height: `${cropData.height}px`,
                                    }}
                                    onMouseDown={handleCropMouseDown}
                                >
                                    {/* Corner resize handles */}
                                    <div 
                                        className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full cursor-nw-resize hover:bg-red-600 transition-colors"
                                        onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
                                    ></div>
                                    <div 
                                        className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full cursor-ne-resize hover:bg-red-600 transition-colors"
                                        onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
                                    ></div>
                                    <div 
                                        className="absolute -bottom-1 -left-1 w-3 h-3 bg-red-500 rounded-full cursor-sw-resize hover:bg-red-600 transition-colors"
                                        onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
                                    ></div>
                                    <div 
                                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full cursor-se-resize hover:bg-red-600 transition-colors"
                                        onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
                                    ></div>
                                    
                                    {/* Edge resize handles */}
                                    <div 
                                        className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-400 rounded-full cursor-n-resize hover:bg-red-500 transition-colors opacity-75"
                                        onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
                                    ></div>
                                    <div 
                                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-400 rounded-full cursor-s-resize hover:bg-red-500 transition-colors opacity-75"
                                        onMouseDown={(e) => handleResizeMouseDown(e, 's')}
                                    ></div>
                                    <div 
                                        className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-400 rounded-full cursor-w-resize hover:bg-red-500 transition-colors opacity-75"
                                        onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
                                    ></div>
                                    <div 
                                        className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-400 rounded-full cursor-e-resize hover:bg-red-500 transition-colors opacity-75"
                                        onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
                                    ></div>
                                    
                                    {/* Center label */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                            16:9
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Dark overlay for non-crop areas */}
                                <div className="absolute inset-0 bg-black/50 pointer-events-none">
                                    <div
                                        className="bg-transparent"
                                        style={{
                                            position: 'absolute',
                                            left: `${cropData.x}px`,
                                            top: `${cropData.y}px`,
                                            width: `${cropData.width}px`,
                                            height: `${cropData.height}px`,
                                            boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5)`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Área seleccionada: {Math.round(cropData.width)} x {Math.round(cropData.height)} px
                                <br />
                                Posición: {Math.round(cropData.x)}, {Math.round(cropData.y)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                💡 Arrastra para mover • Usa esquinas/bordes para redimensionar
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsCropDialogOpen(false)}>
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                            </Button>
                            <Button onClick={applyCrop} disabled={cropData.width === 0 || cropData.height === 0}>
                                <Crop className="h-4 w-4 mr-2" />
                                Aplicar Recorte
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
