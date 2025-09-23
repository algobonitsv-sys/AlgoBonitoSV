// src/lib/api/stockOrders.ts
import { supabase } from '../supabaseClient';
import { api } from './products';

export interface StockOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
}

export interface StockOrder {
  id: string;
  order_date: string;
  items: StockOrderItem[];
  status: 'pending' | 'received' | 'cancelled';
  created_at: string;
  updated_at?: string;
}

export interface StockOrderWithDetails extends StockOrder {
  total_cost?: number;
  total_potential_income?: number;
  total_potential_profit?: number;
  items_with_prices: Array<StockOrderItem & {
    cost: number;
    price: number;
    current_stock: number;
  }>;
}

// API para manejar pedidos de stock
export const stockOrdersApi = {
  // Obtener todos los pedidos
  getAll: async (): Promise<{ success: boolean; data: StockOrderWithDetails[]; error?: string }> => {
    try {
      // Por ahora usamos localStorage, pero esto podría moverse a Supabase más tarde
      const orders = JSON.parse(localStorage.getItem('stockOrders') || '[]') as StockOrder[];
      
      // Enriquecer pedidos con información de productos
      const enrichedOrders: StockOrderWithDetails[] = [];
      
      for (const order of orders) {
        const itemsWithPrices = [];
        let totalCost = 0;
        let totalPotentialIncome = 0;
        
        for (const item of order.items) {
          // Obtener información del producto
          const productsResponse = await api.products.getAll();
          if (productsResponse.success && productsResponse.data) {
            const product = productsResponse.data.find(p => p.id === item.product_id);
            if (product) {
              const cost = product.cost || 0;
              const price = product.price || 0;
              const currentStock = product.stock || 0;
              
              itemsWithPrices.push({
                ...item,
                cost,
                price,
                current_stock: currentStock
              });
              
              totalCost += cost * item.quantity;
              totalPotentialIncome += price * item.quantity;
            }
          }
        }
        
        enrichedOrders.push({
          ...order,
          total_cost: totalCost,
          total_potential_income: totalPotentialIncome,
          total_potential_profit: totalPotentialIncome - totalCost,
          items_with_prices: itemsWithPrices
        });
      }
      
      return {
        success: true,
        data: enrichedOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      };
    } catch (error) {
      console.error('Error getting stock orders:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  },

  // Actualizar estado de un pedido
  updateStatus: async (orderId: string, status: StockOrder['status']): Promise<{ success: boolean; error?: string }> => {
    try {
      const orders = JSON.parse(localStorage.getItem('stockOrders') || '[]') as StockOrder[];
      const orderIndex = orders.findIndex(order => order.id === orderId);
      
      if (orderIndex === -1) {
        return { success: false, error: 'Pedido no encontrado' };
      }
      
      // Actualizar el estado
      orders[orderIndex].status = status;
      orders[orderIndex].updated_at = new Date().toISOString();
      
      // Si el pedido se marca como recibido, actualizar el stock de los productos
      if (status === 'received') {
        const order = orders[orderIndex];
        
        for (const item of order.items) {
          try {
            // Obtener el producto actual
            const productsResponse = await api.products.getAll();
            if (productsResponse.success && productsResponse.data) {
              const product = productsResponse.data.find(p => p.id === item.product_id);
              if (product) {
                // Actualizar el stock sumando la cantidad del pedido
                const newStock = (product.stock || 0) + item.quantity;
                await api.products.update(product.id, { stock: newStock });
                console.log(`📦 Stock actualizado para ${product.name}: ${product.stock || 0} + ${item.quantity} = ${newStock}`);
              }
            }
          } catch (error) {
            console.error(`Error updating stock for product ${item.product_id}:`, error);
          }
        }
      }
      
      localStorage.setItem('stockOrders', JSON.stringify(orders));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating stock order status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  },

  // Actualizar un pedido (nueva función para editar)
  update: async (orderId: string, updatedItems: StockOrderItem[]): Promise<{ success: boolean; error?: string }> => {
    try {
      const orders = JSON.parse(localStorage.getItem('stockOrders') || '[]') as StockOrder[];
      const orderIndex = orders.findIndex(order => order.id === orderId);
      
      if (orderIndex === -1) {
        return { success: false, error: 'Pedido no encontrado' };
      }
      
      // Solo permitir editar pedidos pendientes
      if (orders[orderIndex].status !== 'pending') {
        return { success: false, error: 'Solo se pueden editar pedidos pendientes' };
      }
      
      // Actualizar los items del pedido
      orders[orderIndex].items = updatedItems;
      orders[orderIndex].updated_at = new Date().toISOString();
      
      localStorage.setItem('stockOrders', JSON.stringify(orders));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating stock order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  },

  // Eliminar un pedido
  delete: async (orderId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const orders = JSON.parse(localStorage.getItem('stockOrders') || '[]') as StockOrder[];
      const filteredOrders = orders.filter(order => order.id !== orderId);
      
      localStorage.setItem('stockOrders', JSON.stringify(filteredOrders));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting stock order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
};