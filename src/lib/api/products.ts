import { supabase } from '@/lib/supabaseClient';
import type {
  ApiResponse,
  Product,
  ProductInsert,
  ProductUpdate,
  ProductWithDetails,
  Material,
  MaterialInsert,
  MaterialUpdate,
  Category,
  CategoryInsert,
  CategoryUpdate,
  Subcategory,
  SubcategoryInsert,
  SubcategoryUpdate,
  Model,
  ModelInsert,
  ModelUpdate,
  Name,
  NameInsert,
  NameUpdate,
  FAQ,
  FAQInsert,
  FAQUpdate,
  CarouselImage,
  CarouselImageInsert,
  CarouselImageUpdate,
  ProductMaterial,
  ProductMaterialInsert,
  ProductInventory,
  ProductInventoryInsert,
  ProductInventoryUpdate,
  StockMovement,
  StockMovementInsert,
  SaleItem,
  SaleItemInsert,
  SaleItemUpdate,
  Order,
  OrderInsert,
  OrderUpdate,
  OrderItem,
  OrderItemInsert,
  OrderWithItems,
  OrderStatus,
  Novedad,
  NovedadInsert,
  NovedadUpdate,
} from '@/types/database';

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

const handleError = (error: any): string => {
  console.error('API Error:', error);
  
  // Handle different types of errors
  if (error?.message) {
    console.error('Error message:', error.message);
    return error.message;
  }
  
  if (error?.details) {
    console.error('Error details:', error.details);
    return error.details;
  }
  
  if (error?.hint) {
    console.error('Error hint:', error.hint);
    return error.hint;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  console.error('Unknown error type:', typeof error, error);
  return 'An unexpected error occurred';
};

const createResponse = <T>(data: T | null, error: string | null): ApiResponse<T> => ({
  data,
  error,
  success: !error,
});

// Check if Supabase is properly configured
const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const isConfigured = Boolean(
    supabase !== null && 
    url && 
    key && 
    !url.includes('your_supabase_url_here') && 
    !url.includes('your-project-id') &&
    !key.includes('your_supabase_anon_key_here') &&
    !key.includes('your-anon-key')
  );
  
  console.log('🔍 Supabase configuration check:');
  console.log('- Client exists:', supabase !== null);
  console.log('- URL valid:', !!(url && !url.includes('your')));
  console.log('- Key valid:', !!(key && !key.includes('your')));
  console.log('- Final result:', isConfigured);
  
  return isConfigured;
};

// =====================================================
// CATEGORIES API
// =====================================================

export const categoriesApi = {
  // Get all categories
  async getAll(): Promise<ApiResponse<Category[]>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning fallback categories');
        // Return fallback categories when Supabase is not configured
        const fallbackCategories: Category[] = [
          { id: '1', name: 'Aros', description: 'Aros de diferentes materiales y estilos', order_index: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '2', name: 'Collares', description: 'Collares y cadenas elegantes', order_index: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '3', name: 'Anillos', description: 'Anillos para toda ocasión', order_index: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '4', name: 'Pulseras', description: 'Pulseras y brazaletes modernos', order_index: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '5', name: 'Piercings', description: 'Piercings de alta calidad', order_index: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '6', name: 'Accesorios', description: 'Accesorios complementarios', order_index: 6, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];
        return createResponse(fallbackCategories, null);
      }

      // Try with order_index first, fallback to name ordering if column doesn't exist
      let { data, error } = await supabase!
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true }); // Secondary sort by name

      // If order_index column doesn't exist, try without it
      if (error && error.message?.includes('order_index')) {
        console.log('order_index column not found, falling back to name ordering');
        const fallbackResult = await supabase!
          .from('categories')
          .select('*')
          .order('name', { ascending: true });
        
        data = fallbackResult.data;
        error = fallbackResult.error;
      }

      if (error) throw error;
      return createResponse(data || [], null);
    } catch (error) {
      return createResponse([] as Category[], handleError(error));
    }
  },

  // Get category by ID
  async getById(id: string): Promise<ApiResponse<Category | null>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Create category
  async create(category: CategoryInsert): Promise<ApiResponse<Category | null>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, simulating category creation');
        // In fallback mode, create a mock category
        const mockCategory: Category = {
          id: Math.random().toString(36).substr(2, 9),
          name: category.name,
          description: category.description || null,
          order_index: category.order_index || 999,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return createResponse(mockCategory, null);
      }

      const { data, error } = await supabase!
        .from('categories')
        .insert(category as any)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Update category
  async update(id: string, updates: CategoryUpdate): Promise<ApiResponse<Category | null>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, simulating category update');
        // In fallback mode, return a mock updated category
        const mockCategory: Category = {
          id,
          name: updates.name || 'Updated Category',
          description: updates.description || null,
          order_index: updates.order_index || 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return createResponse(mockCategory, null);
      }

      const { data, error } = await supabase!
        .from('categories')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Update category order
  async updateOrder(categoryOrders: { id: string; order_index: number }[]): Promise<ApiResponse<boolean>> {
    try {
      console.log('🔍 Checking Supabase configuration...');
      const isConfigured = isSupabaseConfigured();
      console.log('🔍 Supabase configured:', isConfigured);
      
      if (!isConfigured) {
        console.log('⚠️ Supabase not configured, simulating order update');
        // In fallback mode, just simulate success
        // The UI will handle the reordering locally
        return createResponse(true, null);
      }

      console.log('🔄 Attempting to update order in Supabase...');
      // Update each category's order_index
      const updatePromises = categoryOrders.map(({ id, order_index }) =>
        supabase!
          .from('categories')
          .update({ order_index })
          .eq('id', id)
      );

      const results = await Promise.all(updatePromises);
      
      // Check if any updates failed
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Update errors:', errors);
        throw new Error(`Failed to update ${errors.length} categories`);
      }

      return createResponse(true, null);
    } catch (error) {
      console.error('❌ updateOrder error:', error);
      return createResponse(false, handleError(error));
    }
  },

  // Delete category
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, simulating category deletion');
        // In fallback mode, just simulate success
        return createResponse(true, null);
      }

      const { error } = await supabase!
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return createResponse(true, null);
    } catch (error) {
      return createResponse(false, handleError(error));
    }
  },
};

// =====================================================
// SUBCATEGORIES API
// =====================================================

export const subcategoriesApi = {
  // Get all subcategories
  async getAll(): Promise<ApiResponse<Subcategory[]>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning fallback subcategories');
        // Return fallback subcategories when Supabase is not configured
        const fallbackSubcategories: Subcategory[] = [
          // Aros subcategories
          { id: '1', category_id: '1', name: 'Acero quirúrgico', description: 'Material de alta calidad', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '2', category_id: '1', name: 'Acero blanco', description: 'Material de alta calidad', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '3', category_id: '1', name: 'Acero dorado', description: 'Material de alta calidad', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '4', category_id: '1', name: 'Plata 925', description: 'Material de alta calidad', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          // Collares subcategories
          { id: '5', category_id: '2', name: 'Acero quirúrgico', description: 'Material de alta calidad', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '6', category_id: '2', name: 'Acero blanco', description: 'Material de alta calidad', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '7', category_id: '2', name: 'Acero dorado', description: 'Material de alta calidad', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '8', category_id: '2', name: 'Plata 925', description: 'Material de alta calidad', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          // Piercings subcategories
          { id: '9', category_id: '5', name: 'Titanio', description: 'Material especializado para piercings', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '10', category_id: '5', name: 'Acero quirúrgico', description: 'Material especializado para piercings', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '11', category_id: '5', name: 'Oro blanco', description: 'Material especializado para piercings', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '12', category_id: '5', name: 'Plata', description: 'Material especializado para piercings', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          // Accesorios subcategories
          { id: '13', category_id: '6', name: 'Varios materiales', description: 'Materiales variados para accesorios', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '14', category_id: '6', name: 'Acero inoxidable', description: 'Materiales variados para accesorios', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '15', category_id: '6', name: 'Aleaciones', description: 'Materiales variados para accesorios', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];
        return createResponse(fallbackSubcategories, null);
      }

      const { data, error } = await supabase!
        .from('subcategories')
        .select('*')
        .order('name');

      if (error) throw error;
      return createResponse(data || [], null);
    } catch (error) {
      return createResponse([] as Subcategory[], handleError(error));
    }
  },

  // Get subcategories by category
  async getByCategory(categoryId: string): Promise<ApiResponse<Subcategory[]>> {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .order('name');

      if (error) throw error;
      return createResponse(data || [], null);
    } catch (error) {
      return createResponse([] as Subcategory[], handleError(error));
    }
  },

  // Create subcategory
  async create(subcategory: SubcategoryInsert): Promise<ApiResponse<Subcategory | null>> {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .insert(subcategory as any)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Update subcategory
  async update(id: string, updates: SubcategoryUpdate): Promise<ApiResponse<Subcategory | null>> {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Delete subcategory
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return createResponse(true, null);
    } catch (error) {
      return createResponse(false, handleError(error));
    }
  },
};

// =====================================================
// MODELS API
// =====================================================

export const modelsApi = {
  // Get all models
  async getAll(): Promise<ApiResponse<Model[]>> {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .order('name');

      if (error) throw error;
      return createResponse(data || [], null);
    } catch (error) {
      return createResponse([] as Model[], handleError(error));
    }
  },

  // Get model by ID
  async getById(id: string): Promise<ApiResponse<Model | null>> {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Create model
  async create(model: ModelInsert): Promise<ApiResponse<Model | null>> {
    try {
      const { data, error } = await supabase
        .from('models')
        .insert(model as any)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Update model
  async update(id: string, updates: ModelUpdate): Promise<ApiResponse<Model | null>> {
    try {
      const { data, error } = await supabase
        .from('models')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Delete model
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('models')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return createResponse(true, null);
    } catch (error) {
      return createResponse(false, handleError(error));
    }
  },
};

// =====================================================
// NAMES API
// =====================================================

export const namesApi = {
  // Get all names
  async getAll(): Promise<ApiResponse<Name[]>> {
    try {
      const { data, error } = await supabase
        .from('names')
        .select('*')
        .order('name');

      if (error) throw error;
      return createResponse(data || [], null);
    } catch (error) {
      return createResponse([] as Name[], handleError(error));
    }
  },

  // Create name
  async create(name: NameInsert): Promise<ApiResponse<Name | null>> {
    try {
      const { data, error } = await supabase
        .from('names')
        .insert(name as any)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Update name
  async update(id: string, updates: NameUpdate): Promise<ApiResponse<Name | null>> {
    try {
      const { data, error } = await supabase
        .from('names')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Delete name
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('names')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return createResponse(true, null);
    } catch (error) {
      return createResponse(false, handleError(error));
    }
  },
};

// =====================================================
// MATERIALS API
// =====================================================

export const materialsApi = {
  // Get all materials
  async getAll(): Promise<ApiResponse<Material[]>> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('name');

      if (error) throw error;
      return createResponse(data || [], null);
    } catch (error) {
      return createResponse([] as Material[], handleError(error));
    }
  },

  // Get material by ID
  async getById(id: string): Promise<ApiResponse<Material | null>> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Get low stock materials
  async getLowStock(): Promise<ApiResponse<Material[]>> {
    try {
      const { data, error } = await supabase
        .from('low_stock_materials')
        .select('*')
        .order('stock_difference');

      if (error) throw error;
      return createResponse(data || [], null);
    } catch (error) {
      return createResponse([] as Material[], handleError(error));
    }
  },

  // Create material
  async create(material: MaterialInsert): Promise<ApiResponse<Material | null>> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .insert(material as any)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Update material
  async update(id: string, updates: MaterialUpdate): Promise<ApiResponse<Material | null>> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Delete material
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return createResponse(true, null);
    } catch (error) {
      return createResponse(false, handleError(error));
    }
  },
};

// =====================================================
// PRODUCTS API
// =====================================================

export const productsApi = {
  // Get all products
  async getAll(): Promise<ApiResponse<Product[]>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning fallback products');
        return createResponse([], null);
      }
      
      const { data, error } = await supabase!
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      return createResponse(data || [], null);
    } catch (error) {
      return createResponse([] as Product[], handleError(error));
    }
  },

  // Get product by ID
  async getById(id: string): Promise<ApiResponse<Product | null>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning null');
        return createResponse(null, null);
      }

      const { data, error } = await supabase!
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Get product by slug (using name as slug)
  async getBySlug(slug: string): Promise<ApiResponse<Product | null>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning null');
        return createResponse(null, null);
      }

      // Convert slug back to name format (replace dashes with spaces and title case)
      const searchTerms = slug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      );

      // Try multiple search strategies
      let data = null;
      let error = null;

      // Strategy 1: Exact match with full reconstructed name
      const fullName = searchTerms.join(' ');
      const exactResponse = await supabase!
        .from('products')
        .select(`
          *,
          categories(name),
          subcategories(name)
        `)
        .eq('name', fullName)
        .eq('is_active', true)
        .maybeSingle();

      if (exactResponse.data) {
        return createResponse(exactResponse.data, null);
      }

      // Strategy 2: Case-insensitive partial match
      const partialResponse = await supabase!
        .from('products')
        .select(`
          *,
          categories(name),
          subcategories(name)
        `)
        .ilike('name', `%${fullName}%`)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (partialResponse.data) {
        return createResponse(partialResponse.data, null);
      }

      // Strategy 3: Search by individual words
      for (const term of searchTerms) {
        if (term.length > 2) { // Only search meaningful words
          const wordResponse = await supabase!
            .from('products')
            .select(`
              *,
              categories(name),
              subcategories(name)
            `)
            .ilike('name', `%${term}%`)
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();

          if (wordResponse.data) {
            return createResponse(wordResponse.data, null);
          }
        }
      }

      // If no product found
      return createResponse(null, null);
      
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Search products by query
  async search(query: string, options?: {
    limit?: number;
    offset?: number;
    includeInactive?: boolean;
  }): Promise<ApiResponse<Product[]>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, using fallback search data');
        
        // Create some fallback products for development
        const fallbackProducts: Product[] = [
          {
            id: '1',
            name: 'Collar Elegante Luna',
            description: 'Hermoso collar con diseño de luna para ocasiones especiales',
            category_id: '1',
            subcategory_id: null,
            model_id: null,
            name_id: null,
            cost: 25,
            price: 45,
            cover_image: 'https://picsum.photos/900/1600?v=10',
            hover_image: 'https://picsum.photos/900/1600?v=20',
            product_images: null,
            is_active: true,
            is_featured: false,
            is_new: true,
            stock: 5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Anillo de Plata Moderno',
            description: 'Anillo elegante de plata con diseño contemporáneo',
            category_id: '2',
            subcategory_id: null,
            model_id: null,
            name_id: null,
            cost: 20,
            price: 35,
            cover_image: 'https://picsum.photos/900/1600?v=11',
            hover_image: 'https://picsum.photos/900/1600?v=21',
            product_images: null,
            is_active: true,
            is_featured: true,
            is_new: false,
            stock: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Aretes de Oro Rosa',
            description: 'Delicados aretes de oro rosa perfectos para cualquier ocasión',
            category_id: '3',
            subcategory_id: null,
            model_id: null,
            name_id: null,
            cost: 15,
            price: 28,
            cover_image: 'https://picsum.photos/900/1600?v=12',
            hover_image: 'https://picsum.photos/900/1600?v=22',
            product_images: null,
            is_active: true,
            is_featured: false,
            is_new: false,
            stock: 7,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ];

        // Filter by search term
        const searchTerm = query.trim().toLowerCase();
        const filteredProducts = fallbackProducts.filter(product => 
          product.name.toLowerCase().includes(searchTerm) ||
          (product.description && product.description.toLowerCase().includes(searchTerm))
        );

        return createResponse(filteredProducts, null);
      }

      if (!query.trim()) {
        return createResponse([], null);
      }

      const limit = options?.limit || 20;
      const offset = options?.offset || 0;
      const includeInactive = options?.includeInactive || false;

      // Normalize search query
      const searchTerm = query.trim().toLowerCase();
      
      let queryBuilder = supabase!
        .from('products')
        .select('*');

      // Add activity filter
      if (!includeInactive) {
        queryBuilder = queryBuilder.eq('is_active', true);
      }

      // Search in name and description fields using OR condition
      queryBuilder = queryBuilder.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

      // Add pagination and ordering
      queryBuilder = queryBuilder
        .order('name')
        .range(offset, offset + limit - 1);

      const { data, error } = await queryBuilder;

      if (error) throw error;
      return createResponse(data || [], null);
    } catch (error) {
      return createResponse([] as Product[], handleError(error));
    }
  },

  // Get search suggestions (for autocomplete)
  async searchSuggestions(query: string, limit: number = 5): Promise<ApiResponse<string[]>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning empty suggestions');
        return createResponse([], null);
      }

      if (!query.trim() || query.length < 2) {
        return createResponse([], null);
      }

      const searchTerm = query.trim().toLowerCase();
      
      const { data, error } = await supabase!
        .from('products')
        .select('name')
        .eq('is_active', true)
        .ilike('name', `%${searchTerm}%`)
        .limit(limit);

      if (error) throw error;
      
      const suggestions = (data || []).map(item => item.name);
      return createResponse(suggestions, null);
    } catch (error) {
      return createResponse([] as string[], handleError(error));
    }
  },

  // Create product
  async create(product: ProductInsert): Promise<ApiResponse<Product | null>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, simulating product creation');
        const mockProduct: Product = {
          id: Math.random().toString(36).substr(2, 9),
          name: product.name || '',
          description: product.description || null,
          category_id: product.category_id || null,
          subcategory_id: product.subcategory_id || null,
          model_id: null,
          name_id: null,
          cost: product.cost || 0,
          price: product.price || 0,
          cover_image: product.cover_image || null,
          hover_image: product.hover_image || null,
          product_images: product.product_images || null,
          is_active: product.is_active ?? true,
          is_featured: product.is_featured ?? false,
          is_new: product.is_new ?? false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return createResponse(mockProduct, null);
      }

      const { data, error } = await supabase!
        .from('products')
        .insert([product] as any)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Update product
  async update(id: string, updates: ProductUpdate): Promise<ApiResponse<Product | null>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, simulating product update');
        const mockProduct: Product = {
          id,
          name: updates.name || 'Updated Product',
          description: updates.description || null,
          category_id: updates.category_id || null,
          subcategory_id: updates.subcategory_id || null,
          model_id: null,
          name_id: null,
          cost: updates.cost || 0,
          price: updates.price || 0,
          cover_image: updates.cover_image || null,
          hover_image: updates.hover_image || null,
          product_images: updates.product_images || null,
          is_active: updates.is_active ?? true,
          is_featured: updates.is_featured ?? false,
          is_new: updates.is_new ?? false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return createResponse(mockProduct, null);
      }

      const { data, error } = await supabase!
        .from('products')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Delete product
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, simulating product deletion');
        return createResponse(true, null);
      }

      const { error } = await supabase!
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return createResponse(true, null);
    } catch (error) {
      return createResponse(false, handleError(error));
    }
  },

  // Get featured products
  async getFeatured(limit?: number): Promise<ApiResponse<Product[]>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning fallback featured products');
        return createResponse([], null);
      }
      
      let query = supabase!
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('name');

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return createResponse(data || [], null);
    } catch (error) {
      return createResponse([] as Product[], handleError(error));
    }
  },
};

// =====================================================
// INVENTORY API
// =====================================================

export const inventoryApi = {
  // Get product inventory
  async getProductInventory(productId: string): Promise<ApiResponse<ProductInventory | null>> {
    try {
      const { data, error } = await supabase
        .from('product_inventory')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Create or update product inventory
  async upsertProductInventory(inventory: ProductInventoryInsert): Promise<ApiResponse<ProductInventory | null>> {
    try {
      const { data, error } = await supabase
        .from('product_inventory')
        .upsert(inventory as any)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Update product inventory
  async updateProductInventory(productId: string, updates: ProductInventoryUpdate): Promise<ApiResponse<ProductInventory | null>> {
    try {
      const { data, error } = await supabase
        .from('product_inventory')
        .update(updates as any)
        .eq('product_id', productId)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Get stock movements
  async getStockMovements(materialId?: string): Promise<ApiResponse<StockMovement[]>> {
    try {
      let query = supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false });

      if (materialId) {
        query = query.eq('material_id', materialId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return createResponse(data || [], null);
    } catch (error) {
      return createResponse([] as StockMovement[], handleError(error));
    }
  },

  // Create stock movement
  async createStockMovement(movement: StockMovementInsert): Promise<ApiResponse<StockMovement | null>> {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .insert(movement as any)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },
};

// =====================================================
// FAQS API
// =====================================================

export const faqsApi = {
  // Get all FAQs
  async getAll(): Promise<ApiResponse<FAQ[]>> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return createResponse(data || [], null);
    } catch (error) {
      return createResponse([] as FAQ[], handleError(error));
    }
  },

  // Get FAQs by category
  async getByCategory(category: string): Promise<ApiResponse<FAQ[]>> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return createResponse(data || [], null);
    } catch (error) {
      return createResponse([] as FAQ[], handleError(error));
    }
  },

  // Get active FAQs
  async getActive(): Promise<ApiResponse<FAQ[]>> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return createResponse(data || [], null);
    } catch (error) {
      return createResponse([] as FAQ[], handleError(error));
    }
  },

  // Create FAQ
  async create(faq: FAQInsert): Promise<ApiResponse<FAQ | null>> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .insert(faq as any)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Update FAQ
  async update(id: string, updates: FAQUpdate): Promise<ApiResponse<FAQ | null>> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Delete FAQ
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return createResponse(true, null);
    } catch (error) {
      return createResponse(false, handleError(error));
    }
  },

  // Update FAQ order
  async updateOrder(id: string, newOrder: number): Promise<ApiResponse<FAQ | null>> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .update({ order_index: newOrder })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },
};

// =====================================================
// CAROUSEL IMAGES API
// =====================================================

export const carouselImagesApi = {
  // Get all carousel images
  async getAll(): Promise<ApiResponse<CarouselImage[]>> {
    try {
      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return createResponse(data || [], null);
    } catch (error) {
      return createResponse([] as CarouselImage[], handleError(error));
    }
  },

  // Get active carousel images
  async getActive(): Promise<ApiResponse<CarouselImage[]>> {
    try {
      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return createResponse(data || [], null);
    } catch (error) {
      return createResponse([] as CarouselImage[], handleError(error));
    }
  },

  // Get carousel image by ID
  async getById(id: string): Promise<ApiResponse<CarouselImage | null>> {
    try {
      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Create carousel image
  async create(carouselImage: CarouselImageInsert): Promise<ApiResponse<CarouselImage | null>> {
    try {
      const { data, error } = await supabase
        .from('carousel_images')
        .insert(carouselImage as any)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Update carousel image
  async update(id: string, carouselImage: CarouselImageUpdate): Promise<ApiResponse<CarouselImage | null>> {
    try {
      const { data, error } = await supabase
        .from('carousel_images')
        .update(carouselImage as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Delete carousel image
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('carousel_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return createResponse(true, null);
    } catch (error) {
      return createResponse(false, handleError(error));
    }
  },

  // Update order
  async updateOrder(id: string, newOrder: number): Promise<ApiResponse<CarouselImage | null>> {
    try {
      const { data, error } = await supabase
        .from('carousel_images')
        .update({ order_index: newOrder })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },
};

// =====================================================
// ORDERS API
// =====================================================

const ordersApi = {
  // Get all orders
  async getAll(): Promise<ApiResponse<OrderWithItems[]>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning empty array');
        return createResponse([], null);
      }

      const { data: orders, error: ordersError } = await supabase!
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get order items for each order
      const ordersWithItems: OrderWithItems[] = [];
      
      for (const order of orders || []) {
        const { data: items, error: itemsError } = await supabase!
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        if (itemsError) throw itemsError;

        ordersWithItems.push({
          ...order,
          items: items || []
        });
      }

      return createResponse(ordersWithItems, null);
    } catch (error) {
      return createResponse([], handleError(error));
    }
  },

  // Get order by ID with items
  async getById(id: string): Promise<ApiResponse<OrderWithItems | null>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning null');
        return createResponse(null, null);
      }

      const { data: order, error: orderError } = await supabase!
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (orderError) throw orderError;

      const { data: items, error: itemsError } = await supabase!
        .from('order_items')
        .select('*')
        .eq('order_id', id);

      if (itemsError) throw itemsError;

      const orderWithItems: OrderWithItems = {
        ...order,
        items: items || []
      };

      return createResponse(orderWithItems, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Create order with items
  async create(orderData: OrderInsert, items: any[]): Promise<ApiResponse<OrderWithItems | null>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning mock order');
        const mockOrder: OrderWithItems = {
          id: `mock-${Date.now()}`,
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          customer_email: orderData.customer_email || null,
          status: orderData.status || 'pending',
          total_amount: orderData.total_amount || 0,
          notes: orderData.notes || null,
          whatsapp_sent_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          items: items.map((item, index) => ({
            id: `mock-item-${index}`,
            order_id: `mock-${Date.now()}`,
            product_id: item.product_id,
            product_name: item.product_name,
            product_price: item.product_price,
            quantity: item.quantity,
            subtotal: item.subtotal,
            created_at: new Date().toISOString()
          }))
        };
        return createResponse(mockOrder, null);
      }

      // Create order first
      const { data: order, error: orderError } = await supabase!
        .from('orders')
        .insert(orderData as any)
        .select()
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error('Order creation failed');

      // Create order items
      const itemsWithOrderId = items.map((item: any) => ({
        ...item,
        order_id: (order as any).id
      }));

      const { data: createdItems, error: itemsError } = await supabase!
        .from('order_items')
        .insert(itemsWithOrderId as any)
        .select();

      if (itemsError) throw itemsError;

      const orderWithItems: OrderWithItems = {
        ...(order as any),
        items: createdItems || []
      };

      return createResponse(orderWithItems, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Update order status
  async updateStatus(id: string, status: OrderStatus, whatsappSent?: boolean): Promise<ApiResponse<Order | null>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning null');
        return createResponse(null, null);
      }

      const updateData: any = { status };
      
      if (whatsappSent) {
        updateData.whatsapp_sent_at = new Date().toISOString();
      }

      const { data, error } = await supabase!
        .from('orders')
        .update(updateData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data as any, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Get orders by status
  async getByStatus(status: OrderStatus): Promise<ApiResponse<OrderWithItems[]>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning empty array');
        return createResponse([], null);
      }

      const { data: orders, error: ordersError } = await supabase!
        .from('orders')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get order items for each order
      const ordersWithItems: OrderWithItems[] = [];
      
      for (const order of orders || []) {
        const { data: items, error: itemsError } = await supabase!
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        if (itemsError) throw itemsError;

        ordersWithItems.push({
          ...order,
          items: items || []
        });
      }

      return createResponse(ordersWithItems, null);
    } catch (error) {
      return createResponse([], handleError(error));
    }
  },

  // Delete order
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning true');
        return createResponse(true, null);
      }

      const { error } = await supabase!
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return createResponse(true, null);
    } catch (error) {
      return createResponse(false, handleError(error));
    }
  }
};

// =====================================================
// EXPORT ALL APIs
// =====================================================

// =====================================================
// PRODUCT SALES API
// =====================================================

export const productSalesApi = {
  // Get all product sales
  async getAll(): Promise<ApiResponse<SaleItem[]>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning mock product sales');
        return createResponse([], null);
      }

      const { data, error } = await supabase!
        .from('sale_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return createResponse(data as SaleItem[] || [], null);
    } catch (error) {
      return createResponse([] as SaleItem[], handleError(error));
    }
  },

  // Get sales by date range
  async getByDateRange(startDate: string, endDate: string): Promise<ApiResponse<SaleItem[]>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning mock product sales');
        return createResponse([], null);
      }

      const { data, error } = await supabase!
        .from('sale_items')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return createResponse(data as SaleItem[] || [], null);
    } catch (error) {
      return createResponse([] as SaleItem[], handleError(error));
    }
  },

  // Get sales by product
  async getByProduct(productId: string): Promise<ApiResponse<SaleItem[]>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning mock product sales');
        return createResponse([], null);
      }

      const { data, error } = await supabase!
        .from('sale_items')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return createResponse(data as SaleItem[] || [], null);
    } catch (error) {
      return createResponse([] as SaleItem[], handleError(error));
    }
  },

  // Create new product sale
  async create(saleData: SaleItemInsert): Promise<ApiResponse<SaleItem>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, simulating product sale creation');
        const mockSale: SaleItem = {
          id: `mock-sale-${Date.now()}`,
          sale_id: 'mock-sale-id',
          product_id: saleData.product_id || null,
          quantity: saleData.quantity || 1,
          unit_price: saleData.unit_price,
          unit_cost: saleData.unit_cost || 0,
          total_price: saleData.total_price || (saleData.quantity || 1) * saleData.unit_price,
          total_cost: saleData.total_cost || 0,
          created_at: new Date().toISOString(),
        };
        return createResponse(mockSale, null);
      }

      // Calculate total_price if not provided
      const quantity = saleData.quantity || 1;
      const totalPrice = saleData.total_price || (quantity * saleData.unit_price);

      const saleToInsert = {
        product_id: saleData.product_id,
        quantity: quantity,
        unit_price: saleData.unit_price,
        total_price: totalPrice,
        unit_cost: saleData.unit_cost || 0,
        total_cost: saleData.total_cost || 0,
      };

      console.log('🔍 Attempting to insert sale data:', saleToInsert);
      console.log('🔍 Supabase client configured:', !!supabase);

      const { data, error } = await supabase!
        .from('sale_items')
        .insert(saleToInsert)
        .select()
        .single();

      console.log('🔍 Supabase response - data:', data);
      console.log('🔍 Supabase response - error:', error);

      if (error) throw error;
      return createResponse(data as SaleItem, null);
    } catch (error) {
      return createResponse(null as any, handleError(error));
    }
  },

  // Update product sale
  async update(id: string, updates: SaleItemUpdate): Promise<ApiResponse<SaleItem>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, simulating product sale update');
        const mockSale: SaleItem = {
          id,
          sale_id: 'mock-sale-id',
          product_id: 'mock-product-id',
          quantity: 1,
          unit_price: 10,
          unit_cost: 0,
          total_price: 10,
          total_cost: 0,
          created_at: new Date().toISOString(),
          ...updates,
        };
        return createResponse(mockSale, null);
      }

      // Recalculate total_amount if quantity or unit_price changed
      let updateData = { ...updates };
      if (updates.quantity !== undefined || updates.unit_price !== undefined) {
        const { data: currentSale } = await supabase!
          .from('sale_items')
          .select('quantity, unit_price')
          .eq('id', id)
          .single();

        if (currentSale) {
          const newQuantity = updates.quantity ?? (currentSale as any).quantity;
          const newUnitPrice = updates.unit_price ?? (currentSale as any).unit_price;
          updateData.total_price = newQuantity * newUnitPrice;
        }
      }

      const { data, error } = await supabase!
        .from('sale_items')
        .update(updateData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data as SaleItem, null);
    } catch (error) {
      return createResponse(null as any, handleError(error));
    }
  },

  // Delete product sale
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, simulating product sale deletion');
        return createResponse(true, null);
      }

      const { error } = await supabase!
        .from('sale_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return createResponse(true, null);
    } catch (error) {
      return createResponse(false, handleError(error));
    }
  },

  // Get sales statistics
  async getStats(startDate?: string, endDate?: string): Promise<ApiResponse<{
    totalSales: number;
    totalRevenue: number;
    totalQuantity: number;
    averageOrderValue: number;
  }>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning mock sales stats');
        return createResponse({
          totalSales: 0,
          totalRevenue: 0,
          totalQuantity: 0,
          averageOrderValue: 0,
        }, null);
      }

      let query = supabase!
        .from('sale_items')
        .select('quantity, total_price');

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        totalSales: data?.length || 0,
        totalRevenue: data?.reduce((sum, sale: any) => sum + sale.total_price, 0) || 0,
        totalQuantity: data?.reduce((sum, sale: any) => sum + sale.quantity, 0) || 0,
        averageOrderValue: data?.length ? 
          (data.reduce((sum, sale: any) => sum + sale.total_price, 0) / data.length) : 0,
      };

      return createResponse(stats, null);
    } catch (error) {
      const defaultStats = {
        totalSales: 0,
        totalRevenue: 0,
        totalQuantity: 0,
        averageOrderValue: 0,
      };
      return createResponse(defaultStats, handleError(error));
    }
  },
};

// =====================================================
// NOVEDAD API (DISCOVER SECTION)
// =====================================================

export const novedadApi = {
  // Get all novedades (only active one should be shown)
  async getAll(): Promise<ApiResponse<Novedad[]>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning fallback novedad');
        const fallbackNovedad: Novedad = {
          id: '1',
          titulo: 'Descubre la Belleza, Encuentra tu Estilo',
          descripcion: 'Explora nuestra exclusiva colección de joyas, diseñadas para capturar la esencia de la elegancia y la sofisticación. Cada pieza cuenta una historia.',
          enlace: '/products',
          enlace_texto: 'Ver Colección',
          imagen: 'https://picsum.photos/600/400',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return createResponse([fallbackNovedad], null);
      }
      
      const { data, error } = await supabase!
        .from('novedad')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return createResponse(data || [], null);
    } catch (error) {
      return createResponse([] as Novedad[], handleError(error));
    }
  },

  // Get active novedad (main one to show)
  async getActive(): Promise<ApiResponse<Novedad | null>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning fallback novedad');
        const fallbackNovedad: Novedad = {
          id: '1',
          titulo: 'Descubre la Belleza, Encuentra tu Estilo',
          descripcion: 'Explora nuestra exclusiva colección de joyas, diseñadas para capturar la esencia de la elegancia y la sofisticación. Cada pieza cuenta una historia.',
          enlace: '/products',
          enlace_texto: 'Ver Colección',
          imagen: 'https://picsum.photos/600/400',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return createResponse(fallbackNovedad, null);
      }
      
      const { data, error } = await supabase!
        .from('novedad')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return createResponse(data || null, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Get novedad by ID
  async getById(id: string): Promise<ApiResponse<Novedad | null>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, returning null');
        return createResponse(null, null);
      }
      
      const { data, error } = await supabase!
        .from('novedad')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return createResponse(data || null, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Create new novedad
  async create(novedad: NovedadInsert): Promise<ApiResponse<Novedad | null>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, cannot create novedad');
        return createResponse(null, 'Supabase not configured');
      }
      
      const { data, error } = await supabase!
        .from('novedad')
        .insert(novedad)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Update existing novedad
  async update(id: string, updates: NovedadUpdate): Promise<ApiResponse<Novedad | null>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, cannot update novedad');
        return createResponse(null, 'Supabase not configured');
      }
      
      const { data, error } = await supabase!
        .from('novedad')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return createResponse(data, null);
    } catch (error) {
      return createResponse(null, handleError(error));
    }
  },

  // Delete novedad
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, cannot delete novedad');
        return createResponse(false, 'Supabase not configured');
      }
      
      const { error } = await supabase!
        .from('novedad')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return createResponse(true, null);
    } catch (error) {
      return createResponse(false, handleError(error));
    }
  },

  // Set as active (deactivate others and activate this one)
  async setActive(id: string): Promise<ApiResponse<boolean>> {
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, cannot set active novedad');
        return createResponse(false, 'Supabase not configured');
      }
      
      // First, deactivate all
      await supabase!
        .from('novedad')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all rows
      
      // Then activate the selected one
      const { error } = await supabase!
        .from('novedad')
        .update({ is_active: true })
        .eq('id', id);

      if (error) throw error;
      return createResponse(true, null);
    } catch (error) {
      return createResponse(false, handleError(error));
    }
  },
};

export const api = {
  categories: categoriesApi,
  subcategories: subcategoriesApi,
  models: modelsApi,
  names: namesApi,
  materials: materialsApi,
  products: productsApi,
  inventory: inventoryApi,
  faqs: faqsApi,
  carouselImages: carouselImagesApi,
  orders: ordersApi,
  productSales: productSalesApi,
  novedad: novedadApi,
};