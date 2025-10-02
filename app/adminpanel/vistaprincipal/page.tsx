"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Plus, Eye, EyeOff, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { productApi, vistaPrincipalApi } from '@/lib/api';
import type { VistaPrincipal, VistaPrincipalInsert, VistaPrincipalUpdate } from '@/types/database';

const DEFAULT_PAYMENT_TITLE = 'Métodos de Pago';
const DEFAULT_PAYMENT_SUBTITLE = 'Paga de forma rápida y segura.';
const DEFAULT_PAYMENT_BACKGROUND_IMAGE = 'https://picsum.photos/1200/400?v=63';
const DEFAULT_PAYMENT_METHODS = [
  'Tarjetas de Crédito / Débito',
  'Transferencia Bancaria',
  'Pago Contra Entrega',
];

export default function VistaPrincipalAdminPage() {
  const [vistaPrincipal, setVistaPrincipal] = useState<VistaPrincipal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
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
  
  const { toast } = useToast();

  // Load current vista principal
  useEffect(() => {
    loadVistaPrincipal();
    loadPaymentMethods();
  }, []);

  const loadVistaPrincipal = async () => {
    try {
      setIsLoading(true);
      const response = await vistaPrincipalApi.getActive();
      
      if (response.error) {
        console.error('Error loading vista principal:', response.error);
        // Check if it's a table not found error
        if (response.error.includes('Table vista_principal does not exist') || 
            response.error.includes('Could not find the table')) {
          console.log('⚠️ Database table not migrated yet. Using fallback data for initial setup.');
          // The API will return fallback data, so we can proceed normally
        }
        // Initialize with empty values for new creation
        resetForm();
        return;
      }

      if (response.data) {
        setVistaPrincipal(response.data);
        setTitulo(response.data.titulo);
        setDescripcion(response.data.descripcion);
        setEnlace(response.data.enlace);
        setEnlaceTexto(response.data.enlace_texto);
        setImagen(response.data.imagen);
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

      const vistaPrincipalData = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        enlace: enlace.trim(),
        enlace_texto: enlaceTexto.trim(),
        imagen: imagen || null,
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

      // Reload the data
      await loadVistaPrincipal();
      
    } catch (error) {
      console.error('Error saving vista principal:', error);
      toast({
        title: "Error",
        description: "Error al guardar la vista principal",
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

      const payload = {
        title: sanitizedTitle,
        subtitle: sanitizedSubtitle,
        background_image_url: sanitizedBackground || undefined,
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
          image_url: sanitizedBackground || undefined,
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
      setPaymentBackgroundImage(sanitizedBackground || DEFAULT_PAYMENT_BACKGROUND_IMAGE);
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

  const handleCreateNew = () => {
    setIsCreating(true);
    resetForm();
    setTimeout(() => setIsCreating(false), 500);
  };

  const handleImageChange = (newImageUrl: string) => {
    setImagen(newImageUrl || null);
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestión de Vista Principal
            </h1>
            <p className="text-muted-foreground">
              Administra el contenido de la sección "Descubre la Belleza" del homepage
            </p>
          </div>
          
          <div className="flex gap-2">
            {vistaPrincipal && (
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

        {/* Migration Warning */}
        {!vistaPrincipal && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Base de datos no migrada
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    La tabla de base de datos no ha sido migrada aún. Para guardar cambios permanentemente, 
                    ejecuta el siguiente SQL en el editor de Supabase:
                  </p>
                  <pre className="mt-2 p-2 bg-yellow-100 rounded text-xs font-mono">
                    ALTER TABLE novedad RENAME TO vista_principal;
                  </pre>
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
                onImageRemoved={() => handleImageChange('')}
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
                disabled={isSaving || !titulo.trim() || !descripcion.trim()}
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
                    {imagen ? (
                      <img 
                        src={imagen} 
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
                  <Label htmlFor="paymentBackground">Imagen de fondo (URL)</Label>
                  <Input
                    id="paymentBackground"
                    value={paymentBackgroundImage}
                    onChange={(e) => setPaymentBackgroundImage(e.target.value)}
                    placeholder="https://tus-imagenes.com/metodos.jpg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Se usa como fondo difuminado detrás del bloque de métodos de pago.
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
      </div>
    </div>
  );
}