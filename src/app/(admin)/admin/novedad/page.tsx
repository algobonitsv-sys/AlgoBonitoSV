"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Plus, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ImagePreview from "@/components/ui/image-preview";
import { productApi } from '@/lib/api';
import type { Novedad, NovedadInsert, NovedadUpdate } from '@/types/database';

export default function NovedadAdminPage() {
  const [novedad, setNovedad] = useState<Novedad | null>(null);
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
  
  const { toast } = useToast();

  // Load current novedad
  useEffect(() => {
    loadNovedad();
  }, []);

  const loadNovedad = async () => {
    try {
      setIsLoading(true);
      const response = await productApi.novedad.getActive();
      
      if (response.error) {
        console.error('Error loading novedad:', response.error);
        // Initialize with empty values for new creation
        resetForm();
        return;
      }

      if (response.data) {
        setNovedad(response.data);
        setTitulo(response.data.titulo);
        setDescripcion(response.data.descripcion);
        setEnlace(response.data.enlace);
        setEnlaceTexto(response.data.enlace_texto);
        setImagen(response.data.imagen);
        setIsActive(response.data.is_active);
      } else {
        // No active novedad found, initialize for creation
        resetForm();
      }
    } catch (error) {
      console.error('Error loading novedad:', error);
      toast({
        title: "Error",
        description: "Error al cargar la información de la novedad",
        variant: "destructive",
      });
      resetForm();
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitulo('Descubre la Belleza, Encuentra tu Estilo');
    setDescripcion('Explora nuestra exclusiva colección de joyas, diseñadas para capturar la esencia de la elegancia y la sofisticación. Cada pieza cuenta una historia.');
    setEnlace('/products');
    setEnlaceTexto('Ver Colección');
    setImagen(null);
    setIsActive(true);
    setNovedad(null);
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

      const novedadData = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        enlace: enlace.trim(),
        enlace_texto: enlaceTexto.trim(),
        imagen: imagen || null,
        is_active: isActive,
      };

      let response;
      
      if (novedad?.id) {
        // Update existing
        response = await productApi.novedad.update(novedad.id, novedadData as NovedadUpdate);
      } else {
        // Create new
        response = await productApi.novedad.create(novedadData as NovedadInsert);
      }

      if (response.error) {
        throw new Error(response.error);
      }

      // If we're setting this as active, make sure to set it as active
      if (isActive && response.data?.id) {
        await productApi.novedad.setActive(response.data.id);
      }

      toast({
        title: "Éxito",
        description: novedad?.id 
          ? "Novedad actualizada correctamente" 
          : "Novedad creada correctamente",
      });

      // Reload the data
      await loadNovedad();
      
    } catch (error) {
      console.error('Error saving novedad:', error);
      toast({
        title: "Error",
        description: "Error al guardar la novedad",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
              Gestión de Novedad
            </h1>
            <p className="text-muted-foreground">
              Administra el contenido de la sección "Descubre la Belleza" del homepage
            </p>
          </div>
          
          <div className="flex gap-2">
            {novedad && (
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
                Nueva Novedad
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {novedad ? 'Editar Novedad' : 'Crear Nueva Novedad'}
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
              <Label>Imagen de la Sección</Label>
              <ImagePreview
                value={imagen || ''}
                onChange={handleImageChange}
                aspectRatio="16:9"
                label="Imagen de la Sección"
                placeholder="https://picsum.photos/600/400"
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
                {novedad ? 'Actualizar Novedad' : 'Crear Novedad'}
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
      </div>
    </div>
  );
}