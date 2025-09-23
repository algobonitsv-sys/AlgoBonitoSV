
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
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Plus, Edit, Trash2, Package, DollarSign, ImageIcon, Eye, ShoppingCart, Star, Archive, History, TrendingUp, ChevronDown, Minus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Import API functions and types
import { 
  productApi, 
  financeApi,
  useAuth,
  type Product,
  type Material,
  type Category,
  type Subcategory,
  type Model,
  type Name,
  type ProductInsert,
  type StockMovementInsert,
  type SaleInsert,
  type SaleItemInsert
} from '@/lib/api';

interface ProductFormData {
  name: string;
  description: string;
  category_id: string;
  subcategory_id: string;
  model_id?: string;
  name_id?: string;
  cost: string;
  price: string;
  cover_image: string;
  product_images: string[];
  materials: { material_id: string; quantity: number }[];
}

interface SaleFormData {
  customer_name: string;
  customer_phone: string;
  payment_method: 'cash' | 'card' | 'transfer' | 'other';
  items: { product_id: string; quantity: number; unit_price: number }[];
}

interface StockIngressFormData {
  ingress_date: string;
  movements: { material_id: string; quantity: number; unit_cost: number; reason: string }[];
  notes: string;
}

export default function AdminProductsPage() {
  // Auth state
  const { user, isAdmin, loading: authLoading } = useAuth();

  // Data state
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [names, setNames] = useState<Name[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const [isStockIngressDialogOpen, setIsStockIngressDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category_id: '',
    subcategory_id: '',
    model_id: '',
    name_id: '',
    cost: '',
    price: '',
    cover_image: '',
    product_images: [],
    materials: []
  });

  const [saleFormData, setSaleFormData] = useState<SaleFormData>({
    customer_name: '',
    customer_phone: '',
    payment_method: 'cash',
    items: []
  });

  const [stockIngressFormData, setStockIngressFormData] = useState<StockIngressFormData>({
    ingress_date: new Date().toISOString().split('T')[0],
    movements: [],
    notes: ''
  });

  // Image input state
  const [currentImageInput, setCurrentImageInput] = useState('');

  // Load initial data
  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) return;

    loadData();
  }, [user, isAdmin, authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        productsRes,
        categoriesRes,
        subcategoriesRes,
        materialsRes,
        modelsRes,
        namesRes
      ] = await Promise.all([
        productApi.products.getAll(),
        productApi.categories.getAll(),
        productApi.subcategories.getAll(),
        productApi.materials.getAll(),
        productApi.models.getAll(),
        productApi.names.getAll()
      ]);

      if (productsRes.success) setProducts(productsRes.data || []);
      if (categoriesRes.success) setCategories(categoriesRes.data || []);
      if (subcategoriesRes.success) setSubcategories(subcategoriesRes.data || []);
      if (materialsRes.success) setMaterials(materialsRes.data || []);
      if (modelsRes.success) setModels(modelsRes.data || []);
      if (namesRes.success) setNames(namesRes.data || []);

      // Show any errors
      [productsRes, categoriesRes, subcategoriesRes, materialsRes, modelsRes, namesRes]
        .forEach(res => {
          if (res.error) {
            toast.error(`Error loading data: ${res.error}`);
          }
        });

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('El nombre del producto es requerido');
      return;
    }
    if (!formData.category_id) {
      toast.error('La categoría es requerida');
      return;
    }
    if (!formData.subcategory_id) {
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

    setSaving(true);
    try {
      const productData: ProductInsert = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id,
        model_id: formData.model_id || undefined,
        name_id: formData.name_id || undefined,
        cost: parseFloat(formData.cost),
        price: parseFloat(formData.price),
        cover_image: formData.cover_image.trim() || undefined,
        product_images: formData.product_images.filter(img => img.trim()),
        is_active: true
      };

      let result;
      if (editingProduct) {
        // Update existing product
        result = await productApi.products.update(editingProduct.id, productData);
        if (result.success) {
          toast.success('Producto actualizado correctamente');
        }
      } else {
        // Create new product
        result = await productApi.products.create(productData);
        if (result.success) {
          toast.success('Producto creado correctamente');
          
          // Add materials to product if any
          if (formData.materials.length > 0 && result.data) {
            for (const material of formData.materials) {
              await productApi.products.addMaterial({
                product_id: result.data.id,
                material_id: material.material_id,
                quantity: material.quantity
              });
            }
          }
        }
      }

      if (result?.success) {
        resetForm();
        await loadData(); // Reload data
      } else {
        toast.error(result?.error || 'Error saving product');
      }

    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category_id: product.category_id || '',
      subcategory_id: product.subcategory_id || '',
      model_id: product.model_id || '',
      name_id: product.name_id || '',
      cost: product.cost?.toString() || '',
      price: product.price?.toString() || '',
      cover_image: product.cover_image || '',
      product_images: product.product_images || [],
      materials: product.materials?.map((pm: any) => ({
        material_id: pm.material_id,
        quantity: pm.quantity
      })) || []
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      const result = await productApi.products.delete(id);
      if (result.success) {
        toast.success('Producto eliminado correctamente');
        await loadData();
      } else {
        toast.error(result.error || 'Error deleting product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  const handleSale = async () => {
    if (saleFormData.items.length === 0) {
      toast.error('Debe agregar al menos un item a la venta');
      return;
    }

    setSaving(true);
    try {
      const totalAmount = saleFormData.items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
      );

      const saleData: SaleInsert = {
        customer_name: saleFormData.customer_name.trim() || undefined,
        customer_phone: saleFormData.customer_phone.trim() || undefined,
        subtotal: totalAmount,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: totalAmount,
        payment_method: saleFormData.payment_method,
        payment_status: 'paid',
        sale_status: 'confirmed'
      };

      const saleItems: SaleItemInsert[] = saleFormData.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        unit_cost: 0, // Should be calculated from product cost
        total_cost: 0
      }));

      const result = await financeApi.sales.create(saleData, saleItems);
      
      if (result.success) {
        toast.success('Venta registrada correctamente');
        setSaleFormData({
          customer_name: '',
          customer_phone: '',
          payment_method: 'cash',
          items: []
        });
        setIsSaleDialogOpen(false);
      } else {
        toast.error(result.error || 'Error registering sale');
      }

    } catch (error) {
      console.error('Error registering sale:', error);
      toast.error('Error registering sale');
    } finally {
      setSaving(false);
    }
  };

  const handleStockIngress = async () => {
    if (stockIngressFormData.movements.length === 0) {
      toast.error('Debe agregar al menos un movimiento de stock');
      return;
    }

    setSaving(true);
    try {
      for (const movement of stockIngressFormData.movements) {
        // Get current stock
        const material = materials.find(m => m.id === movement.material_id);
        const previousStock = material?.current_stock || 0;
        const newStock = previousStock + movement.quantity;

        const stockMovement: StockMovementInsert = {
          material_id: movement.material_id,
          movement_type: 'in',
          quantity: movement.quantity,
          previous_stock: previousStock,
          new_stock: newStock,
          unit_cost: movement.unit_cost,
          total_cost: movement.quantity * movement.unit_cost,
          reason: movement.reason || 'Stock ingress',
          reference_type: 'purchase'
        };

        await productApi.inventory.createStockMovement(stockMovement);
      }

      toast.success('Ingreso de stock registrado correctamente');
      setStockIngressFormData({
        ingress_date: new Date().toISOString().split('T')[0],
        movements: [],
        notes: ''
      });
      setIsStockIngressDialogOpen(false);
      await loadData();

    } catch (error) {
      console.error('Error registering stock ingress:', error);
      toast.error('Error registering stock ingress');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category_id: '',
      subcategory_id: '',
      model_id: '',
      name_id: '',
      cost: '',
      price: '',
      cover_image: '',
      product_images: [],
      materials: []
    });
    setEditingProduct(null);
    setIsDialogOpen(false);
    setCurrentImageInput('');
  };

  const addProductImage = () => {
    if (currentImageInput.trim() && !formData.product_images.includes(currentImageInput.trim())) {
      setFormData({
        ...formData,
        product_images: [...formData.product_images, currentImageInput.trim()]
      });
      setCurrentImageInput('');
    }
  };

  const removeProductImage = (index: number) => {
    setFormData({
      ...formData,
      product_images: formData.product_images.filter((_, i) => i !== index)
    });
  };

  const addMaterial = () => {
    setFormData({
      ...formData,
      materials: [...formData.materials, { material_id: '', quantity: 1 }]
    });
  };

  const updateMaterial = (index: number, field: string, value: any) => {
    const newMaterials = [...formData.materials];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    setFormData({ ...formData, materials: newMaterials });
  };

  const removeMaterial = (index: number) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter((_, i) => i !== index)
    });
  };

  // Filter subcategories by selected category
  const filteredSubcategories = subcategories.filter(
    sub => sub.category_id === formData.category_id
  );

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Sin categoría';
  };

  const getSubcategoryName = (subcategoryId: string) => {
    const subcategory = subcategories.find(s => s.id === subcategoryId);
    return subcategory?.name || 'Sin subcategoría';
  };

  const getModelName = (modelId?: string) => {
    if (!modelId) return 'Sin modelo';
    const model = models.find(m => m.id === modelId);
    return model?.name || 'Modelo no encontrado';
  };

  const getNameValue = (nameId?: string) => {
    if (!nameId) return 'Sin nombre';
    const name = names.find(n => n.id === nameId);
    return name?.name || 'Nombre no encontrado';
  };

  // Calculate stats
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.price || 0), 0);
  const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Access denied
  if (!user || !isAdmin) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
        <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Productos</h1>
          <p className="text-muted-foreground">Administra el catálogo completo de productos</p>
        </div>
        
        <div className="flex gap-2">
          <div className="flex">
            <Button variant="outline" onClick={() => setIsSaleDialogOpen(true)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Registrar Venta
            </Button>
            <Button variant="outline" size="icon" title="Historial de Ventas" className="ml-1">
              <History className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex">
            <Button variant="outline" onClick={() => setIsStockIngressDialogOpen(true)}>
              <Package className="h-4 w-4 mr-2" />
              Registrar Ingreso Stock
            </Button>
            <Button variant="outline" size="icon" title="Historial de Ingresos" className="ml-1">
              <History className="h-4 w-4" />
            </Button>
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

  const handleSellProduct = (product: Product) => {
    setSaleFormData({
      productId: product.id,
      quantity: '1',
      customerName: '',
      customerPhone: '',
      totalAmount: '',
      paymentMethod: 'efectivo'
    });
    setIsSaleDialogOpen(true);
  };

  const handleHighlightProduct = (product: Product) => {
    // Aquí puedes agregar lógica para destacar el producto
    // Por ejemplo, agregar una propiedad "highlighted" al producto
    toast.success(`Producto "${product.name}" destacado correctamente`);
    console.log('Producto destacado:', product.id);
  };

  const handleMarkAsNew = (product: Product) => {
    // Aquí puedes agregar lógica para marcar como nuevo
    // Por ejemplo, agregar una propiedad "isNew" al producto
    toast.success(`Producto "${product.name}" marcado como nuevo`);
    console.log('Producto marcado como nuevo:', product.id);
  };

  // Funciones para manejar el ingreso de stock
  const updateStockQuantity = (productId: string, subcategory: string, newQuantity: number, cost: number) => {
    const existingItemIndex = stockIngressFormData.items.findIndex(
      item => item.productId === productId && item.subcategory === subcategory
    );
    
    const newItems = [...stockIngressFormData.items];
    
    if (newQuantity > 0) {
      if (existingItemIndex >= 0) {
        newItems[existingItemIndex].quantity = newQuantity;
      } else {
        newItems.push({ productId, subcategory, quantity: newQuantity, cost });
      }
    } else {
      if (existingItemIndex >= 0) {
        newItems.splice(existingItemIndex, 1);
      }
    }
    
    setStockIngressFormData({ ...stockIngressFormData, items: newItems });
  };

  const getStockQuantity = (productId: string, subcategory: string): number => {
    const item = stockIngressFormData.items.find(
      item => item.productId === productId && item.subcategory === subcategory
    );
    return item ? item.quantity : 0;
  };

  const incrementQuantity = (productId: string, subcategory: string, cost: number) => {
    const currentQuantity = getStockQuantity(productId, subcategory);
    updateStockQuantity(productId, subcategory, currentQuantity + 1, cost);
  };

  const decrementQuantity = (productId: string, subcategory: string, cost: number) => {
    const currentQuantity = getStockQuantity(productId, subcategory);
    if (currentQuantity > 0) {
      updateStockQuantity(productId, subcategory, currentQuantity - 1, cost);
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
        
        <div className="flex gap-2">
          <div className="flex">
            <Button variant="outline" onClick={() => setIsSaleDialogOpen(true)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Registrar Venta
            </Button>
            <Button variant="outline" size="icon" title="Historial de Ventas" className="ml-1">
              <History className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex">
            <Button variant="outline" onClick={() => setIsStockIngressDialogOpen(true)}>
              <Package className="h-4 w-4 mr-2" />
              Registrar Ingreso Stock
            </Button>
            <Button variant="outline" size="icon" title="Historial de Ingresos" className="ml-1">
              <History className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex">
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
        <Button variant="outline" size="icon" title="Historial de Productos" className="ml-1">
          <History className="h-4 w-4" />
        </Button>
        </div>
        </div>
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
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSellProduct(product)}
                        className="text-green-600 hover:text-green-700"
                        title="Vender"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleHighlightProduct(product)}
                        className="text-yellow-600 hover:text-yellow-700"
                        title="Destacar"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsNew(product)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Nuevo"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog para Registrar Venta */}
      <Dialog open={isSaleDialogOpen} onOpenChange={setIsSaleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Venta</DialogTitle>
            <DialogDescription>
              Completa la información de la venta
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="saleProduct">Producto</Label>
              <select
                id="saleProduct"
                className="w-full p-2 border rounded-md"
                value={saleFormData.productId}
                onChange={(e) => setSaleFormData({ ...saleFormData, productId: e.target.value })}
              >
                <option value="">Seleccionar producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="saleQuantity">Cantidad</Label>
              <Input
                id="saleQuantity"
                type="number"
                min="1"
                value={saleFormData.quantity}
                onChange={(e) => setSaleFormData({ ...saleFormData, quantity: e.target.value })}
                placeholder="1"
              />
            </div>
            
            <div>
              <Label htmlFor="customerName">Nombre del Cliente</Label>
              <Input
                id="customerName"
                value={saleFormData.customerName}
                onChange={(e) => setSaleFormData({ ...saleFormData, customerName: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>
            
            <div>
              <Label htmlFor="customerPhone">Teléfono del Cliente</Label>
              <Input
                id="customerPhone"
                value={saleFormData.customerPhone}
                onChange={(e) => setSaleFormData({ ...saleFormData, customerPhone: e.target.value })}
                placeholder="7000-0000"
              />
            </div>
            
            <div>
              <Label htmlFor="paymentMethod">Método de Pago</Label>
              <select
                id="paymentMethod"
                className="w-full p-2 border rounded-md"
                value={saleFormData.paymentMethod}
                onChange={(e) => setSaleFormData({ ...saleFormData, paymentMethod: e.target.value })}
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            
            {saleFormData.productId && saleFormData.quantity && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Total a Pagar:</p>
                <p className="text-lg font-bold text-green-600">
                  ${((products.find(p => p.id === saleFormData.productId)?.price || 0) * parseInt(saleFormData.quantity || '1')).toFixed(2)}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              // Aquí iría la lógica para guardar la venta
              console.log('Venta registrada:', saleFormData);
              setIsSaleDialogOpen(false);
              setSaleFormData({
                productId: '',
                quantity: '',
                customerName: '',
                customerPhone: '',
                totalAmount: '',
                paymentMethod: 'efectivo'
              });
            }}>
              Registrar Venta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Registrar Ingreso de Stock */}
      <Dialog open={isStockIngressDialogOpen} onOpenChange={setIsStockIngressDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Ingreso de Stock</DialogTitle>
            <DialogDescription>
              Registra los productos que ingresan al inventario
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="ingressDate">Fecha de Ingreso</Label>
              <Input
                id="ingressDate"
                type="date"
                value={stockIngressFormData.ingressDate}
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-muted-foreground mt-1">Fecha automática del día actual</p>
            </div>
            
            <div>
              <Label>Productos a Ingresar</Label>
              <div className="border rounded-lg p-4 space-y-4">
                {products.map((product) => (
                  <Collapsible key={product.id} className="border-b pb-4">
                    <CollapsibleTrigger className="w-full flex justify-between items-center py-2 font-semibold">
                      <span>{product.name}</span>
                      <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 pt-2">
                      {/* Mostrar cada material/subcategoría del producto */}
                      {CATEGORIES[product.category as keyof typeof CATEGORIES]?.subcategories.map((subcategory) => {
                        const currentQuantity = getStockQuantity(product.id, subcategory);
                        return (
                          <div key={subcategory} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <span className="font-medium">{subcategory}</span>
                              <p className="text-sm text-gray-600">Costo: ${product.cost}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {/* Botón menos */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => decrementQuantity(product.id, subcategory, product.cost)}
                                disabled={currentQuantity === 0}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              
                              {/* Input numérico editable */}
                              <Input
                                type="number"
                                min="0"
                                value={currentQuantity}
                                onChange={(e) => {
                                  const newQuantity = parseInt(e.target.value) || 0;
                                  updateStockQuantity(product.id, subcategory, newQuantity, product.cost);
                                }}
                                className="w-20 text-center"
                              />
                              
                              {/* Botón más */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => incrementQuantity(product.id, subcategory, product.cost)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {/* Total por material */}
                            {currentQuantity > 0 && (
                              <div className="ml-4 text-right">
                                <span className="font-medium text-green-600">
                                  ${(currentQuantity * product.cost).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
                
                {stockIngressFormData.items.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total General:</span>
                      <span className="text-lg font-bold text-green-600">
                        ${stockIngressFormData.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stockIngressFormData.items.reduce((sum, item) => sum + item.quantity, 0)} unidades totales
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                value={stockIngressFormData.notes}
                onChange={(e) => setStockIngressFormData({ ...stockIngressFormData, notes: e.target.value })}
                placeholder="Observaciones sobre el ingreso..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockIngressDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              // Aquí iría la lógica para guardar el ingreso de stock
              console.log('Ingreso de stock registrado:', stockIngressFormData);
              setIsStockIngressDialogOpen(false);
              setStockIngressFormData({
                ingressDate: new Date().toISOString().split('T')[0],
                items: [],
                notes: ''
              });
            }}>
              Registrar Ingreso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
