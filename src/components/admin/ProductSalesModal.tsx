'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { productApi, ordersApi } from '@/lib/api';
import type { Product, Category, Subcategory, OrderWithItems } from '@/types/database';
import { ShoppingCart, Filter, Package, CheckCircle, FileText, Truck } from 'lucide-react';

interface ProductSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleRegistered?: () => void;
  preselectedProduct?: Product | null;
}

interface SaleFormData {
  selectedCategory: string;
  selectedName: string;
  selectedSubcategory: string;
  selectedProduct: Product | null;
  quantity: number;
}

type SaleType = 'manual' | 'by_order';

const ALL_CATEGORIES = '__all_categories__';
const ALL_NAMES = '__all_names__';
const ALL_SUBCATEGORIES = '__all_subcategories__';

export default function ProductSalesModal({
  isOpen,
  onClose,
  onSaleRegistered,
  preselectedProduct
}: ProductSalesModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: sale type selection, 2: filters/order selection, 3: product selection, 4: quantity
  const [saleType, setSaleType] = useState<SaleType | null>(null);
  
  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [productNames, setProductNames] = useState<string[]>([]);
  const [filteredProductNames, setFilteredProductNames] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  
  const [formData, setFormData] = useState<SaleFormData>({
    selectedCategory: '',
    selectedName: '',
    selectedSubcategory: '',
    selectedProduct: null,
    quantity: 1
  });

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      resetForm();
    }
  }, [isOpen]);

  // Handle preselected product
  useEffect(() => {
    if (preselectedProduct && allProducts.length > 0) {
      setFormData(prev => ({
        ...prev,
        selectedCategory: preselectedProduct.category_id || ALL_CATEGORIES,
        selectedSubcategory: preselectedProduct.subcategory_id || ALL_SUBCATEGORIES,
        selectedProduct: preselectedProduct
      }));
      setSaleType('manual');
      setStep(4); // Skip to quantity step
    }
  }, [preselectedProduct, allProducts]);

  useEffect(() => {
    if (allProducts.length > 0 && saleType === 'manual') {
      filterProducts();
    }
  }, [formData.selectedCategory, formData.selectedName, formData.selectedSubcategory, allProducts, saleType]);

  const resetForm = () => {
    // Only reset if there's no preselected product
    if (!preselectedProduct) {
      setFormData({
        selectedCategory: ALL_CATEGORIES,
        selectedName: ALL_NAMES,
        selectedSubcategory: ALL_SUBCATEGORIES,
        selectedProduct: null,
        quantity: 1
      });
      setStep(1);
      setSaleType(null);
      setSelectedOrder(null);
    } else {
      // Reset only quantity for preselected product
      setFormData(prev => ({
        ...prev,
        quantity: 1
      }));
      setStep(4);
      setSaleType('manual');
    }
  };

  const loadInitialData = async () => {
    try {
      const [categoriesRes, subcategoriesRes, productsRes, ordersRes] = await Promise.all([
        productApi.categories.getAll(),
        productApi.subcategories.getAll(),
        productApi.products.getAll(),
        ordersApi.getAll()
      ]);

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
      if (subcategoriesRes.success && subcategoriesRes.data) {
        setSubcategories(subcategoriesRes.data);
      }
      if (productsRes.success && productsRes.data) {
        const products = productsRes.data.filter((p: any) => p.is_active);
        setAllProducts(products);
        
        // Extract unique product names
        const uniqueNames = Array.from(new Set(products.map((p: any) => p.name))).sort() as string[];
        setProductNames(uniqueNames);
        
        setFilteredProducts(products);
      }
      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Error al cargar los datos');
    }
  };

  const filterProducts = async () => {
    try {
      let filtered = [...allProducts];
      
      // Filtrar por categoría
      if (formData.selectedCategory && formData.selectedCategory !== ALL_CATEGORIES) {
        filtered = filtered.filter(p => p.category_id === formData.selectedCategory);
      }
      
      // Filtrar por subcategoría
      if (formData.selectedSubcategory && formData.selectedSubcategory !== ALL_SUBCATEGORIES) {
        filtered = filtered.filter(p => p.subcategory_id === formData.selectedSubcategory);
      }
      
      // Filtrar por nombre
      if (formData.selectedName && formData.selectedName !== ALL_NAMES) {
        filtered = filtered.filter(p => p.name === formData.selectedName);
      }
      
      setFilteredProducts(filtered);
      
      // Actualizar nombres disponibles según los filtros aplicados
      const availableNames = Array.from(new Set(filtered.map((p: any) => p.name))).sort() as string[];
      setFilteredProductNames(availableNames);
      
    } catch (error) {
      console.error('Error filtering products:', error);
    }
  };

  const handleSaleTypeSelect = (type: SaleType) => {
    setSaleType(type);
    setStep(2);
  };

  const handleOrderSelect = (order: OrderWithItems) => {
    setSelectedOrder(order);
  };

  const handleNextStep = () => {
    if (step === 1) {
      // From sale type selection
      if (!saleType) {
        toast.error('Debe seleccionar un tipo de venta');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // From filters/order selection
      if (saleType === 'manual') {
        if (filteredProducts.length === 0) {
          toast.error('No hay productos que coincidan con los filtros seleccionados');
          return;
        }
        setStep(3);
      } else if (saleType === 'by_order') {
        if (!selectedOrder) {
          toast.error('Debe seleccionar un pedido');
          return;
        }
        // For order-based sales, skip to final step
        setStep(4);
      }
    } else if (step === 3) {
      // From product selection
      if (!formData.selectedProduct) {
        toast.error('Debe seleccionar un producto');
        return;
      }
      setStep(4);
    }
  };

  const handlePreviousStep = () => {
    if (step === 2) {
      setStep(1);
      setSaleType(null);
      setSelectedOrder(null);
    } else if (step === 3) {
      setStep(2);
      setFormData(prev => ({ ...prev, selectedProduct: null }));
    } else if (step === 4) {
      if (saleType === 'by_order') {
        setStep(2);
      } else {
        setStep(3);
      }
    }
  };

  const handleProductSelect = (product: Product) => {
    setFormData(prev => ({
      ...prev,
      selectedProduct: product
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (saleType === 'manual') {
        // Manual sale - single product
        if (!formData.selectedProduct) {
          toast.error('Debe seleccionar un producto');
          return;
        }

        if (formData.quantity <= 0) {
          toast.error('La cantidad debe ser mayor a 0');
          return;
        }

        // Create the sale record
        const saleData = {
          product_id: formData.selectedProduct.id,
          quantity: formData.quantity,
          unit_price: formData.selectedProduct.price,
          total_price: formData.selectedProduct.price * formData.quantity,
          sale_date: new Date().toISOString(),
        };

        const response = await productApi.productSales.create(saleData);

        if (response.success) {
          toast.success(`Venta registrada: ${formData.quantity}x ${formData.selectedProduct.name} por $${saleData.total_price.toFixed(2)}`);
          onSaleRegistered?.();
          onClose();
          resetForm();
        } else {
          toast.error(`Error al registrar la venta: ${response.error}`);
        }
      } else if (saleType === 'by_order') {
        // Order-based sale - register all items from the selected order
        if (!selectedOrder) {
          toast.error('Debe seleccionar un pedido');
          return;
        }

        // Register each item from the order as a separate sale
        const salePromises = selectedOrder.items.map(async (item) => {
          const saleData = {
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.product_price,
            total_price: item.subtotal,
            customer_name: selectedOrder.customer_name,
            customer_phone: selectedOrder.customer_phone || null,
            payment_method: selectedOrder.payment_method || 'cash',
            payment_status: 'paid',
            sale_status: 'confirmed',
            sale_date: new Date().toISOString(),
          };

          return productApi.productSales.create(saleData);
        });

        const results = await Promise.all(salePromises);
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        if (successful > 0) {
          toast.success(`Venta por pedido registrada: ${successful} producto(s) vendido(s)${failed > 0 ? ` (${failed} fallaron)` : ''}`);
          onSaleRegistered?.();
          onClose();
          resetForm();
        } else {
          toast.error('Error al registrar la venta del pedido');
        }
      }
    } catch (error) {
      console.error('Error registering sale:', error);
      toast.error('Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || '';
  };

  const getNameName = (name: string) => {
    return name;
  };

  const getSubcategoryName = (id: string) => {
    return subcategories.find(s => s.id === id)?.name || '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Registrar Venta de Producto
          </DialogTitle>
          <DialogDescription>
            {preselectedProduct && (
              <span className="text-blue-600 font-medium block mb-2">
                Producto preseleccionado: {preselectedProduct.name}
              </span>
            )}
            {step === 1 && 'Seleccione el tipo de venta que desea registrar'}
            {step === 2 && saleType === 'manual' && 'Seleccione los filtros para encontrar el producto'}
            {step === 2 && saleType === 'by_order' && 'Seleccione el pedido para registrar su venta'}
            {step === 3 && 'Seleccione el producto específico de la lista'}
            {step === 4 && 'Confirme los detalles de la venta'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>

          {/* Step 1: Sale Type Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">¿Qué tipo de venta desea registrar?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      saleType === 'manual' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => handleSaleTypeSelect('manual')}
                  >
                    <CardContent className="p-6 text-center">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                      <h4 className="font-semibold mb-2">Venta Manual</h4>
                      <p className="text-sm text-muted-foreground">
                        Seleccionar productos individualmente y especificar cantidades
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      saleType === 'by_order' ? 'ring-2 ring-green-500 bg-green-50' : ''
                    }`}
                    onClick={() => handleSaleTypeSelect('by_order')}
                  >
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      <h4 className="font-semibold mb-2">Venta por Pedido</h4>
                      <p className="text-sm text-muted-foreground">
                        Registrar venta completa de un pedido existente
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Filters for Manual Sale */}
          {step === 2 && saleType === 'manual' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={formData.selectedCategory}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, selectedCategory: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_CATEGORIES}>Todas las categorías</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Name Filter */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Select
                    value={formData.selectedName}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, selectedName: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los nombres" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_NAMES}>Todos los nombres</SelectItem>
                      {(filteredProductNames.length > 0 ? filteredProductNames : productNames).map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subcategory Filter */}
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategoría</Label>
                  <Select
                    value={formData.selectedSubcategory}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, selectedSubcategory: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las subcategorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_SUBCATEGORIES}>Todas las subcategorías</SelectItem>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <Filter className="h-4 w-4 inline mr-2" />
                  Productos encontrados: <span className="font-medium">{filteredProducts.length}</span>
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Order Selection for Order-based Sales */}
          {step === 2 && saleType === 'by_order' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Truck className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="text-lg font-semibold">Seleccionar Pedido</h3>
                <p className="text-sm text-muted-foreground">
                  Elija el pedido del cual desea registrar la venta completa
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay pedidos disponibles</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <Card
                      key={order.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedOrder?.id === order.id ? 'ring-2 ring-green-500 bg-green-50' : ''
                      }`}
                      onClick={() => handleOrderSelect(order)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{order.customer_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Pedido #{order.id.slice(-8)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${order.total_amount.toFixed(2)}</p>
                            <Badge variant="outline" className="text-xs">
                              {order.status === 'confirmed' ? 'Confirmado' :
                               order.status === 'pending' ? 'Pendiente' :
                               order.status === 'delivered' ? 'Entregado' : order.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Productos en el pedido:</h5>
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.product_name}</span>
                              <span>{item.quantity}x ${item.product_price.toFixed(2)} = ${item.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {selectedOrder?.id === order.id && (
                          <div className="mt-3 flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">Pedido seleccionado</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 3: Product Selection for Manual Sales */}
          {step === 3 && saleType === 'manual' && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Filtros aplicados: {formData.selectedCategory && formData.selectedCategory !== ALL_CATEGORIES && `Categoría: ${getCategoryName(formData.selectedCategory)}`}
                {formData.selectedName && formData.selectedName !== ALL_NAMES && `, Nombre: ${getNameName(formData.selectedName)}`}
                {formData.selectedSubcategory && formData.selectedSubcategory !== ALL_SUBCATEGORIES && `, Subcategoría: ${getSubcategoryName(formData.selectedSubcategory)}`}
              </div>
              
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      formData.selectedProduct?.id === product.id
                        ? 'border-2 border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                        : 'border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                    onClick={() => handleProductSelect(product)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium ${
                              formData.selectedProduct?.id === product.id 
                                ? 'text-blue-800' 
                                : 'text-gray-900'
                            }`}>
                              {product.name}
                            </h3>
                            {formData.selectedProduct?.id === product.id && (
                              <CheckCircle className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          {product.description && (
                            <p className={`text-sm mt-1 ${
                              formData.selectedProduct?.id === product.id 
                                ? 'text-blue-600' 
                                : 'text-muted-foreground'
                            }`}>
                              {product.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            formData.selectedProduct?.id === product.id 
                              ? 'text-blue-700' 
                              : 'text-gray-900'
                          }`}>
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron productos con los filtros seleccionados</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Quantity for Manual Sales */}
          {step === 4 && saleType === 'manual' && formData.selectedProduct && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Producto Seleccionado:</h3>
                  <p className="text-lg font-semibold">{formData.selectedProduct.name}</p>
                  <p className="text-muted-foreground">${formData.selectedProduct.price.toFixed(2)} por unidad</p>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="w-full"
                />
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="text-xl font-bold">
                      ${(formData.selectedProduct.price * formData.quantity).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Order Confirmation for Order-based Sales */}
          {step === 4 && saleType === 'by_order' && selectedOrder && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Pedido Seleccionado:</h3>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-green-900">{selectedOrder.customer_name}</p>
                        <p className="text-sm text-green-700">Pedido #{selectedOrder.id.slice(-8)}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        ${selectedOrder.total_amount.toFixed(2)}
                      </Badge>
                    </div>
                    <p className="text-xs text-green-600">
                      Fecha: {new Date(selectedOrder.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h4 className="font-medium">Productos a vender:</h4>
                {selectedOrder.items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Cantidad: {item.quantity} x ${item.product_price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${item.subtotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total de la venta:</span>
                    <span className="text-xl font-bold text-green-600">
                      ${selectedOrder.total_amount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Se registrarán {selectedOrder.items.length} producto(s) como vendidos
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
              >
                Anterior
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            
            {((step < 3 && saleType === 'manual') || (step < 2 && saleType === 'by_order') || step === 1) ? (
              <Button onClick={handleNextStep}>
                Siguiente
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar Venta'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}