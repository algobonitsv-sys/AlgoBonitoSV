
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Name {
  id: string;
  name: string;
  createdAt: string;
}

export default function AdminNamesPage() {
  const [names, setNames] = useState<Name[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingName, setEditingName] = useState<Name | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  // Load names from localStorage on component mount
  useEffect(() => {
    const savedNames = localStorage.getItem('admin-names');
    if (savedNames) {
      setNames(JSON.parse(savedNames));
    }
  }, []);

  // Save names to localStorage whenever names change
  useEffect(() => {
    localStorage.setItem('admin-names', JSON.stringify(names));
  }, [names]);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (editingName) {
      // Update existing name
      setNames(names.map(name => 
        name.id === editingName.id 
          ? { ...name, name: formData.name.trim() }
          : name
      ));
      toast.success('Nombre actualizado correctamente');
    } else {
      // Create new name
      const newName: Name = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        createdAt: new Date().toISOString()
      };
      setNames([...names, newName]);
      toast.success('Nombre creado correctamente');
    }

    // Reset form
    setFormData({ name: '' });
    setEditingName(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (name: Name) => {
    setEditingName(name);
    setFormData({ name: name.name });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este nombre?')) {
      setNames(names.filter(name => name.id !== id));
      toast.success('Nombre eliminado correctamente');
    }
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setEditingName(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Nombres</h1>
          <p className="text-muted-foreground">Administra los nombres de clientes y contactos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Nombre
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingName ? 'Editar Nombre' : 'Agregar Nuevo Nombre'}
              </DialogTitle>
              <DialogDescription>
                {editingName ? 'Modifica la información del nombre' : 'Ingresa la información del nuevo nombre'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Ingresa el nombre completo"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingName ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Names Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {names.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No hay nombres registrados
                </TableCell>
              </TableRow>
            ) : (
              names.map((name) => (
                <TableRow key={name.id}>
                  <TableCell className="font-medium">{name.name}</TableCell>
                  <TableCell>
                    {new Date(name.createdAt).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(name)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(name.id)}
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
