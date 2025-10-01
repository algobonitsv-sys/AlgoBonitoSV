import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Inicializar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const preference = new Preference(client);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, payer, metadata } = body;

    // Validar que tenemos items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No hay items en el carrito' },
        { status: 400 }
      );
    }

    // Validar que tenemos access token
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error('MERCADOPAGO_ACCESS_TOKEN no está configurado');
      return NextResponse.json(
        { error: 'Configuración de pago no disponible' },
        { status: 500 }
      );
    }

    // Crear la preferencia de pago
    const preferenceData = {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || item.title,
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
        currency_id: item.currency_id || 'USD',
      })),
      payer: {
        name: payer?.name || 'Cliente',
        email: payer?.email || undefined,
        phone: payer?.phone ? {
          area_code: payer.phone.area_code || '',
          number: payer.phone.number || '',
        } : undefined,
      },
      back_urls: {
        success: process.env.MERCADOPAGO_SUCCESS_URL || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        failure: process.env.MERCADOPAGO_FAILURE_URL || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure`,
        pending: process.env.MERCADOPAGO_PENDING_URL || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending`,
      },
      auto_return: 'approved' as const,
      notification_url: process.env.MERCADOPAGO_NOTIFICATION_URL || `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhook`,
      metadata: metadata || {},
      statement_descriptor: 'AlgoBonitoSV',
      external_reference: `order_${Date.now()}`,
    };

    console.log('Creating preference with data:', JSON.stringify(preferenceData, null, 2));

    const result = await preference.create({
      body: preferenceData,
    });

    console.log('Preference created successfully:', result.id);

    return NextResponse.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    });

  } catch (error) {
    console.error('Error creating preference:', error);
    
    let errorMessage = 'Error interno del servidor';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}