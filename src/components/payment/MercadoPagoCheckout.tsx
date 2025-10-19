"use client";

import { useEffect, useState } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import type { CartItem } from '@/types/database';

interface MercadoPagoCheckoutProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  shippingLabel?: string;
  paymentSurcharge?: number;
  total: number;
  customerName: string;
  paymentMethod?: string;
  deliveryMethod?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface PaymentPreference {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
}

const mpEnvironment =
  process.env.NEXT_PUBLIC_MERCADOPAGO_ENVIRONMENT?.toLowerCase() ?? 'sandbox';
const preferSandboxCheckout = mpEnvironment !== 'production';

export default function MercadoPagoCheckout({ 
  items, 
  subtotal,
  shippingCost,
  shippingLabel,
  paymentSurcharge = 0,
  total, 
  customerName, 
  paymentMethod = 'mercadopago',
  deliveryMethod = 'entrega',
  onSuccess, 
  onError 
}: MercadoPagoCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preference, setPreference] = useState<PaymentPreference | null>(null);
  const [mpError, setMpError] = useState<string | null>(null);

  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
  const currencyId = process.env.NEXT_PUBLIC_MERCADOPAGO_CURRENCY_ID ?? 'ARS';

  useEffect(() => {
    if (!publicKey) {
      setMpError('No se encontró la clave pública de Mercado Pago (NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY).');
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const globalWindow = window as typeof window & { __mp_initialized?: boolean };

    if (!globalWindow.__mp_initialized) {
      try {
        initMercadoPago(publicKey, { locale: 'es-AR' });
        globalWindow.__mp_initialized = true;
      } catch (error) {
        console.error('Error inicializando Mercado Pago:', error);
        setMpError('No se pudo inicializar Mercado Pago en el navegador.');
      }
    }
  }, [publicKey]);

  const walletPreferenceId = preference?.id ?? null;

  const handlePayment = async () => {
    if (!customerName.trim()) {
      onError?.('Por favor, ingrese su nombre');
      return;
    }

    if (items.length === 0) {
      onError?.('El carrito está vacío');
      return;
    }

    setIsLoading(true);
    setMpError(null);

    try {
      console.log('=== STARTING PAYMENT PROCESS ===');
      console.log('Customer name:', customerName);
      console.log('Items count:', items.length);
      console.log('Total:', total);

      const computedShippingLabel = shippingLabel ?? 'Envío';
      const normalizedSurcharge = Number(paymentSurcharge.toFixed(2));

      console.log('Computed shipping label:', computedShippingLabel);
      console.log('Normalized surcharge:', normalizedSurcharge);

      // Primero guardar la orden en la base de datos
      console.log('=== CREATING ORDER IN DATABASE ===');
      const orderData = {
        customer_name: customerName,
        customer_phone: '+503 0000-0000', // Placeholder ya que no pedimos teléfono
        customer_email: '', // Opcional
        payment_method: paymentMethod,
        shipping_method: deliveryMethod,
        shipping_cost: shippingCost,
        payment_surcharge: normalizedSurcharge,
        total_amount: total,
        notes: `Método de entrega: ${computedShippingLabel}.`,
        metadata: {
          subtotal,
          shipping_label: computedShippingLabel,
          payment_surcharge: normalizedSurcharge,
        },
        items: items.map(item => ({
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        }))
      };

      console.log('Order data:', JSON.stringify(orderData, null, 2));

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      console.log('Order response status:', orderResponse.status);
      console.log('Order response ok:', orderResponse.ok);

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('Order response error text:', errorText);
        throw new Error(`Error al crear la orden: ${orderResponse.status} ${errorText}`);
      }

      const orderResult = await orderResponse.json();
      console.log('Order result:', orderResult);

      if (!orderResult.success) {
        throw new Error('Error al crear la orden: ' + orderResult.error);
      }

      const orderId = orderResult.data?.id;
      console.log('Order ID created:', orderId);

      // Crear la lista de items para Mercado Pago - siempre separados para mejor detalle
      console.log('=== CREATING MERCADOPAGO ITEMS ===');
      const preferenceItems = [
        ...items.map(item => ({
          id: item.product_id,
          title: `Producto: ${item.name}`,
          unit_price: item.price,
          quantity: item.quantity,
          currency_id: currencyId,
        })),
        ...(shippingCost > 0
          ? [{
              id: 'shipping',
              title: `Envío: ${computedShippingLabel}`,
              unit_price: Number(shippingCost.toFixed(2)),
              quantity: 1,
              currency_id: currencyId,
            }]
          : []),
        ...(normalizedSurcharge > 0
          ? [{
              id: 'mercadopago_surcharge',
              title: 'Recargo: Mercado Pago (10%)',
              unit_price: normalizedSurcharge,
              quantity: 1,
              currency_id: currencyId,
            }]
          : []),
      ];

      console.log('Preference items:', JSON.stringify(preferenceItems, null, 2));

      // Crear la preferencia de pago con el ID de la orden como referencia externa
      const requestBody = {
        items: preferenceItems,
        payer: {
          name: customerName,
        },
        metadata: {
          customer_name: customerName,
          order_total: total,
          subtotal,
          shipping_cost: shippingCost,
          shipping_label: computedShippingLabel,
          payment_surcharge: normalizedSurcharge,
          order_id: orderId,
        },
        external_reference: orderId, // Usar el ID de la orden como referencia externa
      };

      console.log('Sending to MercadoPago API:', JSON.stringify(requestBody, null, 2));

      console.log('=== FETCHING MERCADOPAGO PREFERENCE ===');
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('MercadoPago response status:', response.status);
      console.log('MercadoPago response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('MercadoPago response error text:', errorText);
        throw new Error(`Error al crear la preferencia de pago: ${response.status} ${errorText}`);
      }

      const preferenceResponse: PaymentPreference = await response.json();
      console.log('Preference response:', preferenceResponse);

      if (!preferenceResponse.id) {
        throw new Error('La respuesta de Mercado Pago no incluyó un ID de preferencia');
      }

      console.log('Preference ID:', preferenceResponse.id);
      setPreference(preferenceResponse);
      console.log('=== PAYMENT PROCESS COMPLETED SUCCESSFULLY ===');

    } catch (error) {
      console.error('=== ERROR PROCESSING PAYMENT ===');
      console.error('Error type:', typeof error);
      console.error('Error instanceof Error:', error instanceof Error);
      console.error('Error message:', error instanceof Error ? error.message : 'No message');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('Full error object:', error);
      onError?.(error instanceof Error ? error.message : 'Error al procesar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 bg-blue-50">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Pago con Mercado Pago</h3>
        </div>
        
        <div className="space-y-2 text-sm text-blue-700">
          <p>✓ Tarjetas de crédito y débito</p>
          <p>✓ Transferencias bancarias</p>
          <p>✓ Pago en efectivo (puntos de pago)</p>
          <p>✓ Compra protegida</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío ({shippingLabel ?? 'Envío'})</span>
            <span>${shippingCost.toFixed(2)}</span>
          </div>
          {paymentSurcharge > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Recargo Mercado Pago (10%)</span>
              <span>${paymentSurcharge.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between items-center">
            <span className="font-medium">Total a pagar:</span>
            <span className="text-xl font-bold text-green-600">
              ${total.toFixed(2)}
            </span>
          </div>
          <div>
            <p>Cliente: {customerName}</p>
            <p>Artículos: {items.reduce((sum, item) => sum + item.quantity, 0)}</p>
          </div>
        </div>
      </div>

      {!walletPreferenceId && (
        <Button
          onClick={handlePayment}
          disabled={isLoading || !customerName.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando preferencia...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Generar checkout de Mercado Pago
            </>
          )}
        </Button>
      )}

      {walletPreferenceId && !mpError && (
        <div className="space-y-2">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Elegí tu método de pago seguro haciendo clic en el botón de Mercado Pago. Se abrirá una ventana donde podés iniciar sesión o pagar como invitado.
            </p>
          </div>

          {/* Intentar renderizar Wallet, pero con fallback si falla */}
          <div className="wallet-container">
            <Wallet
              key={walletPreferenceId}
              initialization={{ preferenceId: walletPreferenceId }}
              onError={(error) => {
                console.error('Wallet error:', error);
                console.error('Wallet preferenceId:', walletPreferenceId);
                console.error('Wallet initialization failed, will use fallback button');

                // No mostrar error, usar fallback automáticamente
                // setMpError('No se pudo renderizar el checkout de Mercado Pago.');
              }}
              onReady={() => {
                console.log('Wallet ready with preferenceId:', walletPreferenceId);
              }}
            />
          </div>

          {/* Fallback button - siempre visible como alternativa */}
          {(preference?.init_point || preference?.sandbox_init_point) && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2 text-center">
                Si el botón de arriba no funciona, usa esta opción:
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const fallbackUrl = (!preferSandboxCheckout && preference?.init_point)
                    ? preference?.init_point
                    : preference?.sandbox_init_point ?? preference?.init_point;

                  if (!fallbackUrl) {
                    onError?.('No se encontró una URL de checkout alternativa.');
                    return;
                  }

                  console.log('Opening fallback URL:', fallbackUrl);
                  window.open(fallbackUrl, '_blank');
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Abrir checkout de Mercado Pago
              </Button>
            </div>
          )}
        </div>
      )}

      {mpError && (
        <p className="text-sm text-destructive text-center">{mpError}</p>
      )}

      {!walletPreferenceId && (
        <p className="text-xs text-gray-500 text-center">
          Al hacer clic en "Generar checkout" se abrirá el botón oficial de Mercado Pago para elegir tu medio de pago.
        </p>
      )}
    </div>
  );
}