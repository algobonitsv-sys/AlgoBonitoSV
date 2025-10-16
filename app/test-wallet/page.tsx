'use client';

import { useState } from 'react';
import MercadoPagoCheckout from '@/components/payment/MercadoPagoCheckout';
import type { CartItem } from '@/types/database';

export default function TestWalletPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crear un item de prueba con ID de producto real
  const testItem: CartItem = {
    product_id: '89b96bd8-25bd-43b5-b6f1-0eb34b7f409b', // ID del producto creado en la BD
    slug: 'producto-prueba-wallet',
    name: 'Producto de Prueba - Wallet',
    price: 25.00,
    quantity: 1,
  };

  const handleSuccess = () => {
    console.log('Pago exitoso');
  };

  const handleError = (error: string) => {
    console.error('Error en pago:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <h1 className="text-3xl font-bold mb-8">🧪 Prueba del Componente Wallet</h1>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Componente Wallet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Si ves "Wallet error: {'{}'}" en la consola, significa que hay un problema con las credenciales o configuración.
          </p>

          <MercadoPagoCheckout
            items={[testItem]}
            subtotal={25.00}
            shippingCost={0}
            total={25.00}
            customerName="Usuario de Prueba"
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  );
}