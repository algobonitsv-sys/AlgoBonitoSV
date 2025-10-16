const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ragcrbulxcvmjdxxvusa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZ2NyYnVseGN2bWpkeHh2dXNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNTkyNDMsImV4cCI6MjA3MzczNTI0M30.HVVC5INFFQEuuInAYc-ke0vjTeaoJq0spED6UqkYkPk'
);

async function createTestProduct() {
  try {
    console.log('Creando producto de prueba...');

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: 'Producto de Prueba - Wallet',
        description: 'Producto para pruebas del componente Wallet',
        price: 25.00,
        category_id: '28c4f838-caa7-4e48-aada-02d40aa5d876', // Usar una categoría existente
        is_active: true,
        stock: 100
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear producto:', error);
      return;
    }

    console.log('Producto creado exitosamente:', data);
    console.log('ID del producto:', data.id);
  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

createTestProduct();