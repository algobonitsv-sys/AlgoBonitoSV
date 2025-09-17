
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package, DollarSign, ImageIcon, Eye } from 'lucide-react';
import { toast } from 'sonner';

// Product categories and subcategories
const CATEGORIES = {
  'aros': {
    name: 'Aros',
    subcategories: ['Acero quirúrgico', 'blanco', 'dorado']
  },
  'collares': {
    name: 'Collares',
    subcategories: ['Acero quirúrgico', 'blanco', 'dorado', 'Plata 925']
  },
  'anillos': {
    name: 'Anillos',
    subcategories: ['Acero quirúrgico', 'blanco', 'dorado', 'Plata 925']
  },
  'pulseras': {
    name: 'Pulseras',
    subcategories: ['Acero quirúrgico', 'blanco', 'dorado', 'Plata 925']
  }
};

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory: string;
  modelId?: string;
  cost: number;
  price: number;
  coverImage?: string;
  productImages: string[];
  createdAt: string;
}

interface Name {
  id: string;
  name: string;
}

interface Model {
  id: string;
  name: string;
  description?: string;
  profileImage?: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [names, setNames] = useState<Name[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentImageInput, setCurrentImageInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    modelId: 'none',
    cost: '',
    price: '',
    coverImage: '',
    productImages: [] as string[]
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('admin-products');
    const savedNames = localStorage.getItem('admin-names');
    const savedModels = localStorage.getItem('admin-models');
    
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedNames) setNames(JSON.parse(savedNames));
    if (savedModels) setModels(JSON.parse(savedModels));
  }, []);

  // Save products to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem('admin-products', JSON.stringify(products));
  }, [products]);

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('El nombre del producto es requerido');
      return;
    }
    if (!formData.category) {
      toast.error('La categoría es requerida');
      return;
    }
    if (!formData.subcategory) {
      toast.error('La subcategoría es requerida');
      return;
    }
    if (!formData.cost || parseFloat(formData.cost) <= 0) {
      toast.error('El costo debe ser mayor a 0');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return;
    }

    if (editingProduct) {
      // Update existing product
      setProducts(products.map(product => 
        product.id === editingProduct.id 
          ? { 
              ...product,
              name: formData.name.trim(),
              description: formData.description.trim(),
              category: formData.category,
              subcategory: formData.subcategory,
              modelId: formData.modelId === 'none' ? undefined : formData.modelId,
              cost: parseFloat(formData.cost),
              price: parseFloat(formData.price),
              coverImage: formData.coverImage.trim() || undefined,
              productImages: formData.productImages.filter(img => img.trim() !== '')
            }
          : product
      ));
      toast.success('Producto actualizado correctamente');
    } else {
      // Create new product
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        subcategory: formData.subcategory,
        modelId: formData.modelId === 'none' ? undefined : formData.modelId,
        cost: parseFloat(formData.cost),
        price: parseFloat(formData.price),
        coverImage: formData.coverImage.trim() || undefined,
        productImages: formData.productImages.filter(img => img.trim() !== ''),
        createdAt: new Date().toISOString()
      };
      setProducts([...products, newProduct]);
      toast.success('Producto creado correctamente');
    }

    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      subcategory: product.subcategory,
      modelId: product.modelId || 'none',
      cost: product.cost.toString(),
      price: product.price.toString(),
      coverImage: product.coverImage || '',
      productImages: [...product.productImages]
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      setProducts(products.filter(product => product.id !== id));
      toast.success('Producto eliminado correctamente');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      subcategory: '',
      modelId: 'none',
      cost: '',
      price: '',
      coverImage: '',
      productImages: []
    });
    setEditingProduct(null);
    setIsDialogOpen(false);
    setCurrentImageInput('');
  };

  const addProductImage = () => {
    if (currentImageInput.trim() && !formData.productImages.includes(currentImageInput.trim())) {
      setFormData({
        ...formData,
        productImages: [...formData.productImages, currentImageInput.trim()]
      });
      setCurrentImageInput('');
    }
  };

  const removeProductImage = (index: number) => {
    setFormData({
      ...formData,
      productImages: formData.productImages.filter((_, i) => i !== index)
    });
  };

  const getModelName = (modelId?: string) => {
    if (!modelId) return 'Sin modelo';
    const model = models.find(m => m.id === modelId);
    return model ? model.name : 'Modelo no encontrado';
  };

  const getCategoryName = (categoryKey: string) => {
    return CATEGORIES[categoryKey as keyof typeof CATEGORIES]?.name || categoryKey;
  };

  // Calculate stats
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.price * 1), 0);
  const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Productos</h1>
          <p className="text-muted-foreground">Administra el catálogo completo de productos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Modifica la información del producto' : 'Completa toda la información del nuevo producto'}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Información Básica</TabsTrigger>
                <TabsTrigger value="pricing">Precios</TabsTrigger>
                <TabsTrigger value="images">Imágenes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del Producto</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ingresa el nombre del producto"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción detallada del producto"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select value={formData.category} onValueChange={(value) => {
                      setFormData({ ...formData, category: value, subcategory: '' });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORIES).map(([key, category]) => (
                          <SelectItem key={key} value={key}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="subcategory">Material/Subcategoría</Label>
                    <Select 
                      value={formData.subcategory} 
                      onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                      disabled={!formData.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona material" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.category && CATEGORIES[formData.category as keyof typeof CATEGORIES]?.subcategories.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="model">Modelo (Opcional)</Label>
                  <Select value={formData.modelId} onValueChange={(value) => setFormData({ ...formData, modelId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin modelo específico</SelectItem>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cost">Costo ($)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="price">Precio de Venta ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                {formData.cost && formData.price && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Margen de Ganancia:</p>
                    <p className="text-lg font-bold text-green-600">
                      ${(parseFloat(formData.price) - parseFloat(formData.cost)).toFixed(2)} 
                      ({(((parseFloat(formData.price) - parseFloat(formData.cost)) / parseFloat(formData.cost)) * 100).toFixed(1)}%)
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="images" className="space-y-4">
                <div>
                  <Label htmlFor="coverImage">Imagen de Portada</Label>
                  <Input
                    id="coverImage"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="URL de la imagen principal"
                  />
                </div>
                
                <div>
                  <Label>Imágenes del Producto</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentImageInput}
                      onChange={(e) => setCurrentImageInput(e.target.value)}
                      placeholder="URL de imagen adicional"
                    />
                    <Button type="button" onClick={addProductImage}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.productImages.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {formData.productImages.map((image, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          <img src={image} alt={`Imagen ${index + 1}`} className="w-10 h-10 object-cover rounded" />
                          <span className="flex-1 text-sm truncate">{image}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProductImage(index)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingProduct ? 'Actualizar' : 'Crear'} Producto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Inventario</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgPrice.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Margen</TableHead>
              <TableHead>Imágenes</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay productos registrados
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge variant="outline">{getCategoryName(product.category)}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">{product.subcategory}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{getModelName(product.modelId)}</span>
                  </TableCell>
                  <TableCell>${product.cost.toFixed(2)}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className="text-green-600 font-medium">
                      ${(product.price - product.cost).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {product.coverImage && <ImageIcon className="h-4 w-4 text-blue-600" />}
                      <span className="text-xs text-muted-foreground">
                        {product.productImages.length} imgs
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
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
