
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Edit, Trash2, Users, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Model {
  id: string;
  name: string;
  description?: string;
  profileImage?: string;
  createdAt: string;
}

export default function AdminModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    profileImage: '' 
  });

  // Load models from localStorage on component mount
  useEffect(() => {
    const savedModels = localStorage.getItem('admin-models');
    if (savedModels) {
      setModels(JSON.parse(savedModels));
    }
  }, []);

  // Save models to localStorage whenever models change
  useEffect(() => {
    localStorage.setItem('admin-models', JSON.stringify(models));
  }, [models]);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre del modelo es requerido');
      return;
    }

    if (editingModel) {
      // Update existing model
      setModels(models.map(model => 
        model.id === editingModel.id 
          ? { 
              ...model, 
              name: formData.name.trim(),
              description: formData.description.trim(),
              profileImage: formData.profileImage.trim()
            }
          : model
      ));
      toast.success('Modelo actualizado correctamente');
    } else {
      // Create new model
      const newModel: Model = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        profileImage: formData.profileImage.trim(),
        createdAt: new Date().toISOString()
      };
      setModels([...models, newModel]);
      toast.success('Modelo creado correctamente');
    }

    // Reset form
    setFormData({ name: '', description: '', profileImage: '' });
    setEditingModel(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (model: Model) => {
    setEditingModel(model);
    setFormData({ 
      name: model.name,
      description: model.description || '',
      profileImage: model.profileImage || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este modelo?')) {
      setModels(models.filter(model => model.id !== id));
      toast.success('Modelo eliminado correctamente');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', profileImage: '' });
    setEditingModel(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Modelos</h1>
          <p className="text-muted-foreground">Administra los modelos y personas para asociar con productos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Modelo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {editingModel ? 'Editar Modelo' : 'Agregar Nuevo Modelo'}
              </DialogTitle>
              <DialogDescription>
                {editingModel ? 'Modifica la información del modelo' : 'Ingresa la información del nuevo modelo'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Modelo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ingresa el nombre del modelo"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del modelo"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="profileImage">URL de Imagen de Perfil (Opcional)</Label>
                <Input
                  id="profileImage"
                  value={formData.profileImage}
                  onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingModel ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Modelos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{models.length}</div>
          <p className="text-xs text-muted-foreground">
            Modelos registrados en el sistema
          </p>
        </CardContent>
      </Card>

      {/* Models Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modelo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Imagen</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No hay modelos registrados
                </TableCell>
              </TableRow>
            ) : (
              models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell className="max-w-xs">
                    {model.description ? (
                      <span className="text-sm text-muted-foreground truncate block">
                        {model.description}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Sin descripción</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {model.profileImage ? (
                      <div className="flex items-center gap-2">
                        <img 
                          src={model.profileImage} 
                          alt={model.name}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <ImageIcon className="h-4 w-4 text-green-600" />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Sin imagen</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(model.createdAt).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(model)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(model.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
