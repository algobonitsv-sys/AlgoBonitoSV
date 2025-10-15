"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Plus, Eye, EyeOff, Trash2, Truck, Edit2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { productApi, vistaPrincipalApi } from '@/lib/api';
import type { VistaPrincipal, VistaPrincipalInsert, VistaPrincipalUpdate, ShippingMethod, ShippingMethodInsert, ShippingMethodUpdate } from '@/types/database';
import { tempImageStore, TempImageStore } from '@/lib/temp-image-store';

const MIME_TYPE_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const DEFAULT_PAYMENT_TITLE = 'Métodos de Pago';
const DEFAULT_PAYMENT_SUBTITLE = 'Paga de forma rápida y segura.';
const DEFAULT_PAYMENT_BACKGROUND_IMAGE = ''; // Cambiado de URL por defecto a vacío
const DEFAULT_PAYMENT_METHODS = [
  'Tarjetas de crédito/débito (pago en línea seguro)',
  'Transferencia bancaria (Banco Agrícola, BAC)',
  'Pago contra entrega (disponible en San Salvador)',
];

const DEFAULT_SHIPPING_TITLE = 'Detalles de Envío';
const DEFAULT_SHIPPING_NATIONAL_TITLE = 'Envíos Nacionales (El Salvador)';
const DEFAULT_SHIPPING_NATIONAL_DELIVERY_TIME = '2-3 días hábiles';
const DEFAULT_SHIPPING_NATIONAL_COST = '$3.50 tarifa estándar';
const DEFAULT_SHIPPING_NATIONAL_PACKAGING = 'Tus joyas viajan seguras en nuestro empaque de regalo';
const DEFAULT_SHIPPING_INTERNATIONAL_TITLE = 'Envíos Internacionales';
const DEFAULT_SHIPPING_INTERNATIONAL_DESCRIPTION = '¿Vives fuera de El Salvador? ¡No hay problema! Contáctanos directamente por WhatsApp para cotizar tu envío a cualquier parte del mundo.';

export default function VistaPrincipalAdminPage() {
  const [vistaPrincipal, setVistaPrincipal] = useState<VistaPrincipal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDatabaseMigrated, setIsDatabaseMigrated] = useState(true);
  
  // Form fields
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enlace, setEnlace] = useState('/products');
  const [enlaceTexto, setEnlaceTexto] = useState('Ver Colección');
  const [imagen, setImagen] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  // Payment methods section state
  const [paymentSectionId, setPaymentSectionId] = useState<string | null>(null);
  const [paymentTitle, setPaymentTitle] = useState(DEFAULT_PAYMENT_TITLE);
  const [paymentSubtitle, setPaymentSubtitle] = useState(DEFAULT_PAYMENT_SUBTITLE);
  const [paymentBackgroundImage, setPaymentBackgroundImage] = useState(DEFAULT_PAYMENT_BACKGROUND_IMAGE);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([...DEFAULT_PAYMENT_METHODS]);
  const [isLoadingPayment, setIsLoadingPayment] = useState(true);
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  // Shipping methods section state
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [editingShippingMethod, setEditingShippingMethod] = useState<ShippingMethod | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(true);
  const [isSavingShipping, setIsSavingShipping] = useState(false);
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);

  // Shipping method form state
  const [shippingMethodForm, setShippingMethodForm] = useState<ShippingMethodInsert>({
    title: '',
    description: '',
    icon_name: '',
    is_active: true,
    display_order: 0,
  });
  
  const { toast } = useToast();

  const previewImage = useMemo(() => {
    if (!imagen || imagen.trim() === '') {
      return null;
    }

    const trimmed = imagen.trim();

    if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
      return trimmed;
    }

    if (TempImageStore.isTempUrl(trimmed)) {
      const tempData = tempImageStore.getImage(trimmed);
      return tempData?.previewUrl || null;
    }

    return trimmed;
  }, [imagen]);

  const uploadPaymentBackgroundImageIfNeeded = async (imageUrl: string | null): Promise<string | null> => {
    if (!imageUrl || imageUrl.trim() === '') {
      return null;
    }

    const trimmed = imageUrl.trim();

    if (trimmed.startsWith('http') && !trimmed.startsWith('blob:')) {
      return trimmed;
    }

    let fileToUpload: File | null = null;

    const isBlobUrl = trimmed.startsWith('blob:') || trimmed.startsWith('data:');

    if (!isBlobUrl && TempImageStore.isTempUrl(trimmed)) {
      const tempData = tempImageStore.getImage(trimmed);
      if (tempData?.file) {
        fileToUpload = tempData.file;
      }
    }

    if (!fileToUpload) {
      try {
        const response = await fetch(trimmed);
        if (!response.ok) {
          throw new Error('No se pudo acceder a la imagen temporal');
        }
        const blob = await response.blob();
        const extension = MIME_TYPE_EXTENSION_MAP[blob.type] || (blob.type?.split('/')[1] ?? 'png');
        const fileName = `payment-background-${Date.now()}.${extension}`;
        fileToUpload = new File([blob], fileName, { type: blob.type || 'image/png' });
      } catch (error) {
        console.error('Error obteniendo blob de la imagen de métodos de pago:', error);
        throw new Error('No se pudo procesar la imagen seleccionada. Intenta subirla nuevamente.');
      }
    }

    if (!fileToUpload) {
      throw new Error('No se encontró la imagen para subir.');
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('folder', 'payment-background');

    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    let uploadResult: { success?: boolean; url?: string; error?: string } = {};

    try {
      uploadResult = await uploadResponse.json();
    } catch (error) {
      console.error('Error leyendo la respuesta de subida de imagen:', error);
      throw new Error('No se pudo subir la imagen seleccionada.');
    }

    if (!uploadResponse.ok || !uploadResult?.success || !uploadResult?.url) {
      const errorMessage = uploadResult?.error || 'Error al subir la imagen a Cloudflare';
      throw new Error(errorMessage);
    }

    if (!isBlobUrl && TempImageStore.isTempUrl(trimmed)) {
      tempImageStore.removeImage(trimmed);
    }

    return uploadResult.url;
  };

  const uploadVistaPrincipalImageIfNeeded = async (): Promise<string | null> => {
    if (!imagen || imagen.trim() === '') {
      return null;
    }

    const trimmed = imagen.trim();
    console.log('🚀 uploadVistaPrincipalImageIfNeeded: starting with trimmed:', trimmed);

    if (trimmed.startsWith('http') && !trimmed.startsWith('blob:') && !trimmed.startsWith('data:')) {
      console.log('✅ uploadVistaPrincipalImageIfNeeded: returning existing HTTP URL');
      return trimmed;
    }

    // Si es una URL blob o data, siempre intentar subirla
    if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
      console.log('🔄 uploadVistaPrincipalImageIfNeeded: blob/data URL detected, will upload');
    }

    let fileToUpload: File | null = null;

    const isBlobUrl = trimmed.startsWith('blob:') || trimmed.startsWith('data:');
    console.log('🔍 uploadVistaPrincipalImageIfNeeded: isBlobUrl:', isBlobUrl);

    if (!isBlobUrl && TempImageStore.isTempUrl(trimmed)) {
      console.log('📁 uploadVistaPrincipalImageIfNeeded: is temp URL, getting from store');
      const tempData = tempImageStore.getImage(trimmed);
      if (tempData?.file) {
        fileToUpload = tempData.file;
        console.log('✅ uploadVistaPrincipalImageIfNeeded: found file in temp store');
      } else {
        console.log('❌ uploadVistaPrincipalImageIfNeeded: temp URL but no file in store');
      }
    }

    if (!fileToUpload) {
      if (isBlobUrl) {
        console.log('🔄 uploadVistaPrincipalImageIfNeeded: trying to fetch blob URL');
        try {
          const response = await fetch(trimmed);
          if (!response.ok) {
            throw new Error('No se pudo acceder a la imagen temporal');
          }
          const blob = await response.blob();
          const extension = MIME_TYPE_EXTENSION_MAP[blob.type] || (blob.type?.split('/')[1] ?? 'png');
          const fileName = `vista-principal-${Date.now()}.${extension}`;
          fileToUpload = new File([blob], fileName, { type: blob.type || 'image/png' });
          console.log('✅ uploadVistaPrincipalImageIfNeeded: created file from blob');
        } catch (error) {
          console.error('❌ uploadVistaPrincipalImageIfNeeded: error fetching blob:', error);
          throw new Error('La imagen temporal no se puede procesar. Por favor, selecciona la imagen nuevamente.');
        }
      } else {
        console.log('❌ uploadVistaPrincipalImageIfNeeded: no file to upload and not a blob URL');
        throw new Error('No se encontró la imagen para subir. Por favor, selecciona una imagen.');
      }
    }

    if (!fileToUpload) {
      console.log('❌ uploadVistaPrincipalImageIfNeeded: still no file to upload');
      throw new Error('No se encontró la imagen para subir.');
    }

    console.log('📤 uploadVistaPrincipalImageIfNeeded: uploading file to R2');
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('folder', 'vista-principal');

    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    let uploadResult: { success?: boolean; url?: string; error?: string } = {};

    try {
      uploadResult = await uploadResponse.json();
    } catch (error) {
      console.error('❌ uploadVistaPrincipalImageIfNeeded: error parsing upload response:', error);
      throw new Error('No se pudo subir la imagen seleccionada.');
    }

    if (!uploadResponse.ok || !uploadResult?.success || !uploadResult?.url) {
      const errorMessage = uploadResult?.error || 'Error al subir la imagen a Cloudflare';
      console.log('❌ uploadVistaPrincipalImageIfNeeded: upload failed:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ uploadVistaPrincipalImageIfNeeded: upload successful, URL:', uploadResult.url);

    if (!isBlobUrl && TempImageStore.isTempUrl(trimmed)) {
      tempImageStore.removeImage(trimmed);
      console.log('🗑️ uploadVistaPrincipalImageIfNeeded: removed temp image from store');
    }

    return uploadResult.url;
  };

  // Load current vista principal
  useEffect(() => {
    loadVistaPrincipal();
    loadPaymentMethods();
    loadShippingDetails();
  }, []);

  const loadVistaPrincipal = async () => {
    try {
      setIsLoading(true);
      const response = await vistaPrincipalApi.getActive();
      const isFallbackData = response.data?.id === 'fallback';

      if (response.error) {
        console.error('Error loading vista principal:', response.error);
        const tableMissing = response.error.includes('Table vista_principal does not exist') ||
          response.error.includes('Could not find the table');
        setIsDatabaseMigrated(!tableMissing);
        resetForm();
        return;
      }

      if (isFallbackData) {
        setIsDatabaseMigrated(false);
        resetForm();
        return;
      }

      setIsDatabaseMigrated(true);

      if (response.data) {
        setVistaPrincipal(response.data);
        setTitulo(response.data.titulo);
        setDescripcion(response.data.descripcion);
        setEnlace(response.data.enlace);
        setEnlaceTexto(response.data.enlace_texto);
        setImagen(response.data.imagen ? response.data.imagen.trim() : null);
        setIsActive(response.data.is_active);
      } else {
        // No active vista principal found, initialize for creation
        resetForm();
      }
    } catch (error) {
      console.error('Error loading vista principal:', error);
      toast({
        title: "Error",
        description: "Error al cargar la información de la vista principal",
        variant: "destructive",
      });
      setIsDatabaseMigrated(true);
      resetForm();
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      setIsLoadingPayment(true);
      const response = await productApi.aboutContent.getBySection('payment');

      if (response.error) {
        console.error('Error loading payment methods:', response.error);
      }

      if (response.data) {
        setPaymentSectionId(response.data.id);
        setPaymentTitle(response.data.title || DEFAULT_PAYMENT_TITLE);
        setPaymentSubtitle(response.data.subtitle || DEFAULT_PAYMENT_SUBTITLE);
        setPaymentBackgroundImage(
          response.data.background_image_url ||
          response.data.image_url ||
          DEFAULT_PAYMENT_BACKGROUND_IMAGE
        );

        const storedMethods = Array.isArray(response.data.extra_data?.methods)
          ? response.data.extra_data.methods.filter((method: unknown): method is string => typeof method === 'string')
          : [];

        setPaymentMethods(storedMethods.length > 0 ? storedMethods : [...DEFAULT_PAYMENT_METHODS]);
      } else {
        setPaymentSectionId(null);
        setPaymentTitle(DEFAULT_PAYMENT_TITLE);
        setPaymentSubtitle(DEFAULT_PAYMENT_SUBTITLE);
        setPaymentBackgroundImage(DEFAULT_PAYMENT_BACKGROUND_IMAGE);
        setPaymentMethods([...DEFAULT_PAYMENT_METHODS]);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast({
        title: "Error",
        description: "Error al cargar los métodos de pago",
        variant: "destructive",
      });
      setPaymentSectionId(null);
      setPaymentTitle(DEFAULT_PAYMENT_TITLE);
      setPaymentSubtitle(DEFAULT_PAYMENT_SUBTITLE);
      setPaymentBackgroundImage(DEFAULT_PAYMENT_BACKGROUND_IMAGE);
      setPaymentMethods([...DEFAULT_PAYMENT_METHODS]);
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const loadShippingDetails = async () => {
    try {
      setIsLoadingShipping(true);
      const response = await productApi.shippingMethods.getAll();

      if (response.error) {
        console.error('Error loading shipping methods:', response.error);
        toast({
          title: "Error",
          description: "Error al cargar los métodos de envío",
          variant: "destructive",
        });
      }

      setShippingMethods(response.data || []);
    } catch (error) {
      console.error('Error loading shipping methods:', error);
      toast({
        title: "Error",
        description: "Error al cargar los métodos de envío",
        variant: "destructive",
      });
      setShippingMethods([]);
    } finally {
      setIsLoadingShipping(false);
    }
  };

  const resetForm = () => {
    setTitulo('Descubre la Belleza, Encuentra tu Estilo');
    setDescripcion('Explora nuestra exclusiva colección de joyas, diseñadas para capturar la esencia de la elegancia y la sofisticación. Cada pieza cuenta una historia.');
    setEnlace('/products');
    setEnlaceTexto('Ver Colección');
    setImagen(null);
    setIsActive(true);
    setVistaPrincipal(null);
  };

  const handleSave = async () => {
    if (!isDatabaseMigrated) {
      toast({
        title: "Migración pendiente",
        description: "Primero completa la migración de la tabla vista_principal antes de guardar.",
        variant: "destructive",
      });
      return;
    }

    if (!titulo.trim() || !descripcion.trim()) {
      toast({
        title: "Error",
        description: "El título y la descripción son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      const imageUrlToSave = await uploadVistaPrincipalImageIfNeeded();

      const vistaPrincipalData = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        enlace: enlace.trim(),
        enlace_texto: enlaceTexto.trim(),
        imagen: imageUrlToSave,
        is_active: isActive,
      };

      let response;
      
      if (vistaPrincipal?.id) {
        // Update existing
        response = await vistaPrincipalApi.update(vistaPrincipal.id, vistaPrincipalData as VistaPrincipalUpdate);
      } else {
        // Create new
        response = await vistaPrincipalApi.create(vistaPrincipalData as VistaPrincipalInsert);
      }

      if (response.error) {
        throw new Error(response.error);
      }

      // If we're setting this as active, make sure to set it as active
      if (isActive && response.data?.id) {
        await vistaPrincipalApi.setActive(response.data.id);
      }

      toast({
        title: "Éxito",
        description: vistaPrincipal?.id 
          ? "Vista Principal actualizada correctamente" 
          : "Vista Principal creada correctamente",
      });

      setImagen(imageUrlToSave);

      // Reload the data
      await loadVistaPrincipal();
      
    } catch (error) {
      console.error('Error saving vista principal:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la vista principal",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePayment = async () => {
    const sanitizedTitle = paymentTitle.trim();
    const sanitizedSubtitle = paymentSubtitle.trim();
    const sanitizedBackground = paymentBackgroundImage?.trim() || '';
    const sanitizedMethods = paymentMethods
      .map((method) => method.trim())
      .filter((method) => method.length > 0);

    if (!sanitizedTitle || !sanitizedSubtitle) {
      toast({
        title: "Error",
        description: "El título y la descripción de métodos de pago son obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (sanitizedMethods.length === 0) {
      toast({
        title: "Error",
        description: "Agrega al menos un método de pago",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSavingPayment(true);

      // Upload background image if needed
      const backgroundImageUrlToSave = await uploadPaymentBackgroundImageIfNeeded(paymentBackgroundImage);

      const payload = {
        title: sanitizedTitle,
        subtitle: sanitizedSubtitle,
        background_image_url: backgroundImageUrlToSave || undefined,
        extra_data: { methods: sanitizedMethods },
        is_active: true,
        section_type: 'payment' as const,
      };

      let response;
      if (paymentSectionId) {
        response = await productApi.aboutContent.update(paymentSectionId, payload);
      } else {
        response = await productApi.aboutContent.create({
          ...payload,
          image_url: backgroundImageUrlToSave || undefined,
          display_order: 0,
        });
      }

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data?.id) {
        setPaymentSectionId(response.data.id);
      }

      setPaymentTitle(sanitizedTitle);
      setPaymentSubtitle(sanitizedSubtitle);
      setPaymentBackgroundImage(backgroundImageUrlToSave || DEFAULT_PAYMENT_BACKGROUND_IMAGE);
      setPaymentMethods(sanitizedMethods);

      toast({
        title: "Éxito",
        description: "Métodos de pago actualizados correctamente",
      });

      await loadPaymentMethods();
    } catch (error) {
      console.error('Error saving payment methods:', error);
      toast({
        title: "Error",
        description: "Error al guardar los métodos de pago",
        variant: "destructive",
      });
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleEditShippingMethod = (method: ShippingMethod | null) => {
    setEditingShippingMethod(method);
    if (method) {
      setShippingMethodForm({
        title: method.title,
        description: method.description,
        icon_name: method.icon_name || '',
        is_active: method.is_active,
        display_order: method.display_order,
      });
    } else {
      setShippingMethodForm({
        title: '',
        description: '',
        icon_name: '',
        is_active: true,
        display_order: 0,
      });
    }
    setIsShippingDialogOpen(true);
  };

  const handleSaveShippingMethod = async () => {
    const sanitizedTitle = shippingMethodForm.title.trim();
    const sanitizedDescription = shippingMethodForm.description.trim();

    if (!sanitizedTitle || !sanitizedDescription) {
      toast({
        title: "Error",
        description: "El título y descripción son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSavingShipping(true);

      let response;
      if (editingShippingMethod) {
        response = await productApi.shippingMethods.update(editingShippingMethod.id, {
          title: sanitizedTitle,
          description: sanitizedDescription,
          icon_name: shippingMethodForm.icon_name || undefined,
          is_active: shippingMethodForm.is_active,
          display_order: shippingMethodForm.display_order,
        });
      } else {
        response = await productApi.shippingMethods.create({
          title: sanitizedTitle,
          description: sanitizedDescription,
          icon_name: shippingMethodForm.icon_name || undefined,
          is_active: shippingMethodForm.is_active,
          display_order: shippingMethodForm.display_order,
        });
      }

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Éxito",
        description: `Método de envío ${editingShippingMethod ? 'actualizado' : 'creado'} correctamente`,
      });

      setIsShippingDialogOpen(false);
      setEditingShippingMethod(null);
      await loadShippingDetails();
    } catch (error) {
      console.error('Error saving shipping method:', error);
      toast({
        title: "Error",
        description: "Error al guardar el método de envío",
        variant: "destructive",
      });
    } finally {
      setIsSavingShipping(false);
    }
  };

  const handleToggleShippingMethod = async (method: ShippingMethod) => {
    try {
      setIsSavingShipping(true);
      const response = await productApi.shippingMethods.update(method.id, {
        is_active: !method.is_active
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Éxito",
        description: `Método de envío ${method.is_active ? 'desactivado' : 'activado'} correctamente`,
      });

      await loadShippingDetails();
    } catch (error) {
      console.error('Error toggling shipping method:', error);
      toast({
        title: "Error",
        description: "Error al cambiar el estado del método de envío",
        variant: "destructive",
      });
    } finally {
      setIsSavingShipping(false);
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    resetForm();
    setTimeout(() => setIsCreating(false), 500);
  };

  const handleImageChange = (newImageUrl: string | null) => {
    if (!newImageUrl || newImageUrl.trim() === '') {
      setImagen(null);
      return;
    }

    setImagen(newImageUrl.trim());
  };

  const handlePaymentImageChange = (newImageUrl: string | null) => {
    if (!newImageUrl || newImageUrl.trim() === '') {
      setPaymentBackgroundImage('');
      return;
    }

    setPaymentBackgroundImage(newImageUrl.trim());
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestión de Vista Principal
            </h1>
            <p className="text-muted-foreground">
              Administra el contenido de la sección Descubre la Belleza del homepage
            </p>
          </div>
          
          <div className="flex justify-center gap-2">
            {isDatabaseMigrated && (
              <Button
                variant="outline"
                onClick={handleCreateNew}
                disabled={isCreating || isSaving}
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Nueva Vista Principal
              </Button>
            )}
          </div>
        </div>

        {/* Migration Status */}
        {!isDatabaseMigrated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Base de datos no migrada
                </h3>
                <div className="mt-2 text-sm text-yellow-700 space-y-2">
                  <p>
                    La tabla <span className="font-semibold">vista_principal</span> aún no existe. Ejecuta el
                    siguiente SQL en el editor de Supabase para completar la migración:
                  </p>
                  <pre className="p-2 bg-yellow-100 rounded text-xs font-mono">
ALTER TABLE novedad RENAME TO vista_principal;
                  </pre>
                  <p>
                    Una vez renombrada la tabla, vuelve a este panel y recarga la página para empezar a
                    administrar el contenido.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isDatabaseMigrated && !vistaPrincipal && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a1 1 0 00-1 1v4a1 1 0 00.293.707l2.5 2.5a1 1 0 001.414-1.414L11 9.586V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  No hay una vista principal activa todavía
                </h3>
                <div className="mt-2 text-sm text-blue-700 space-y-2">
                  <p>
                    La migración fue exitosa, pero aún no tienes contenido configurado. Completa el formulario
                    de abajo y guarda los cambios para publicar tu primera vista principal.
                  </p>
                  <p className="font-medium">
                    ¿Prefieres partir de cero? Usa el botón <span className="italic">Nueva Vista Principal</span> para limpiar el formulario.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {vistaPrincipal ? 'Editar Vista Principal' : 'Crear Nueva Vista Principal'}
            </CardTitle>
            <CardDescription>
              Configura el título, descripción, enlace e imagen de la sección.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Descubre la Belleza, Encuentra tu Estilo"
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Este es el título principal que aparecerá en la sección
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Explora nuestra exclusiva colección de joyas..."
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Descripción que aparecerá debajo del título
              </p>
            </div>

            {/* Link and Link Text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="enlace">Enlace del Botón</Label>
                <Input
                  id="enlace"
                  value={enlace}
                  onChange={(e) => setEnlace(e.target.value)}
                  placeholder="/products"
                />
                <p className="text-sm text-muted-foreground">
                  URL a la que dirigirá el botón
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enlaceTexto">Texto del Botón</Label>
                <Input
                  id="enlaceTexto"
                  value={enlaceTexto}
                  onChange={(e) => setEnlaceTexto(e.target.value)}
                  placeholder="Ver Colección"
                />
                <p className="text-sm text-muted-foreground">
                  Texto que aparecerá en el botón
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="space-y-2">
              <ImageUpload
                currentImageUrl={imagen || undefined}
                onImageUploaded={handleImageChange}
                onImageRemoved={() => handleImageChange(null)}
                label="Imagen de la Sección"
                folder="vista-principal"
                className="w-full max-w-md"
              />
              <p className="text-sm text-muted-foreground">
                Imagen que aparecerá al lado del contenido (relación de aspecto recomendada: 600x400)
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive" className="flex items-center gap-2">
                {isActive ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
                {isActive ? 'Activa (visible en homepage)' : 'Inactiva (oculta)'}
              </Label>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={
                  isSaving ||
                  !titulo.trim() ||
                  !descripcion.trim() ||
                  !isDatabaseMigrated
                }
                size="lg"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {vistaPrincipal ? 'Actualizar Vista Principal' : 'Crear Vista Principal'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {titulo && descripcion && (
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
              <CardDescription>
                Así se verá la sección en el homepage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                      {titulo}
                    </h2>
                    <p className="text-muted-foreground">
                      {descripcion}
                    </p>
                    <Button size="lg">
                      {enlaceTexto}
                    </Button>
                  </div>
                  <div className="bg-gray-200 rounded-lg aspect-[600/400] flex items-center justify-center">
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-500">Sin imagen</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Methods Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pago</CardTitle>
            <CardDescription>
              Actualiza el bloque de métodos de pago que se muestra en la página principal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingPayment ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentTitle">Título *</Label>
                    <Input
                      id="paymentTitle"
                      value={paymentTitle}
                      onChange={(e) => setPaymentTitle(e.target.value)}
                      placeholder="Métodos de Pago"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentSubtitle">Descripción *</Label>
                    <Input
                      id="paymentSubtitle"
                      value={paymentSubtitle}
                      onChange={(e) => setPaymentSubtitle(e.target.value)}
                      placeholder="Paga de forma rápida y segura."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <ImageUpload
                    currentImageUrl={paymentBackgroundImage || undefined}
                    onImageUploaded={handlePaymentImageChange}
                    onImageRemoved={() => handlePaymentImageChange('')}
                    label="Imagen de fondo"
                    folder="payment-background"
                    className="w-full max-w-md"
                  />
                  <p className="text-sm text-muted-foreground">
                    Se usa como fondo difuminado detrás del bloque de métodos de pago. Puedes subir un archivo o usar una URL.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Métodos disponibles *</Label>
                  <div className="space-y-2">
                    {paymentMethods.map((method, index) => (
                      <div key={`payment-method-${index}`} className="flex gap-2">
                        <Input
                          value={method}
                          onChange={(e) => {
                            const updated = [...paymentMethods];
                            updated[index] = e.target.value;
                            setPaymentMethods(updated);
                          }}
                          placeholder="Nombre del método de pago"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const updated = paymentMethods.filter((_, i) => i !== index);
                            setPaymentMethods(updated);
                          }}
                          disabled={paymentMethods.length <= 1}
                          aria-label="Eliminar método"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPaymentMethods([...paymentMethods, ''])}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar método
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSavePayment}
                    disabled={isSavingPayment || isLoadingPayment}
                    size="lg"
                  >
                    {isSavingPayment ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar Métodos de Pago
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Shipping Methods Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Métodos de Envío
            </CardTitle>
            <CardDescription>
              Gestiona los métodos de envío que se muestran en la página principal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingShipping ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Cargando métodos de envío...
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {shippingMethods.map((method) => (
                    <Card key={method.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{method.title}</h4>
                              <Badge variant={method.is_active ? "default" : "secondary"}>
                                {method.is_active ? "Activo" : "Inactivo"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {method.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {method.icon_name && (
                                <span>Icono: {method.icon_name}</span>
                              )}
                              <span>Orden: {method.display_order}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditShippingMethod(method)}
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleShippingMethod(method)}
                            >
                              {method.is_active ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {shippingMethods.length === 0 && (
                    <div className="text-center py-8">
                      <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No hay métodos de envío</h3>
                      <p className="text-muted-foreground mb-4">
                        Agrega tu primer método de envío para comenzar.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => handleEditShippingMethod(null)}
                    size="lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Método de Envío
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Shipping Method Dialog */}
        <Dialog open={isShippingDialogOpen} onOpenChange={setIsShippingDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingShippingMethod ? 'Editar Método de Envío' : 'Crear Método de Envío'}
              </DialogTitle>
              <DialogDescription>
                {editingShippingMethod
                  ? 'Modifica la información del método de envío.'
                  : 'Completa la información para crear un nuevo método de envío.'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shipping_title">Título *</Label>
                <Input
                  id="shipping_title"
                  value={shippingMethodForm.title}
                  onChange={(e) => setShippingMethodForm({ ...shippingMethodForm, title: e.target.value })}
                  placeholder="Ej: Envíos Nacionales"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping_description">Descripción *</Label>
                <Textarea
                  id="shipping_description"
                  value={shippingMethodForm.description}
                  onChange={(e) => setShippingMethodForm({ ...shippingMethodForm, description: e.target.value })}
                  placeholder="Describe el método de envío..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipping_icon">Nombre del Icono (Opcional)</Label>
                  <Input
                    id="shipping_icon"
                    value={shippingMethodForm.icon_name}
                    onChange={(e) => setShippingMethodForm({ ...shippingMethodForm, icon_name: e.target.value })}
                    placeholder="Ej: Truck, MapPin, Shield"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nombre del icono de Lucide React
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping_order">Orden de Visualización</Label>
                  <Input
                    id="shipping_order"
                    type="number"
                    min="0"
                    value={shippingMethodForm.display_order}
                    onChange={(e) => setShippingMethodForm({ ...shippingMethodForm, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="shipping_active"
                  checked={shippingMethodForm.is_active}
                  onChange={(e) => setShippingMethodForm({ ...shippingMethodForm, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="shipping_active">Método activo (visible en la página)</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsShippingDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveShippingMethod}
                disabled={isSavingShipping}
              >
                {isSavingShipping ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingShippingMethod ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}