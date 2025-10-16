import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { PreferenceRequest } from 'mercadopago/dist/clients/preference/commonTypes';

interface PreferenceItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  description?: string;
  currency_id?: string;
  picture_url?: string;
}

interface PreferenceBody {
  items: PreferenceItem[];
  payer?: {
    name?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
  };
  metadata?: Record<string, unknown>;
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  notification_url?: string;
  external_reference?: string;
  shipments?: PreferenceRequest['shipments'];
  payment_methods?: PreferenceRequest['payment_methods'];
}

function createMercadoPagoPreferenceClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN no está configurado');
  }

  const client = new MercadoPagoConfig({ accessToken });
  return new Preference(client);
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE PREFERENCE REQUEST ===');
    console.log('MERCADOPAGO_ACCESS_TOKEN exists:', !!process.env.MERCADOPAGO_ACCESS_TOKEN);
    console.log('Token starts with:', process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 10));

    const preferenceClient = createMercadoPagoPreferenceClient();
    console.log('Preference client created successfully');

    const body = (await request.json()) as PreferenceBody;
    console.log('Request body:', JSON.stringify(body, null, 2));
    const {
      items,
      payer,
      metadata,
      back_urls,
      notification_url,
      external_reference,
      shipments,
      payment_methods,
    } = body;

    // Validar que tenemos items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No hay items en el carrito' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? (process.env.NODE_ENV === 'development' ? 'http://localhost:9002' : 'https://tu-dominio.com');

    // Variables de validación
    const isProduction = process.env.NODE_ENV === 'production';
    const isMercadoPagoProduction = process.env.NEXT_PUBLIC_MERCADOPAGO_ENVIRONMENT === 'production';

    // Configurar URLs de retorno según las mejores prácticas de Mercado Pago
    const resolvedBackUrls = back_urls || {
      success: (isMercadoPagoProduction ? process.env.MERCADOPAGO_SUCCESS_URL : null) ?? `${baseUrl}/payment/success`,
      failure: (isMercadoPagoProduction ? process.env.MERCADOPAGO_FAILURE_URL : null) ?? `${baseUrl}/payment/failure`,
      pending: (isMercadoPagoProduction ? process.env.MERCADOPAGO_PENDING_URL : null) ?? `${baseUrl}/payment/pending`,
    };

    // En desarrollo con sandbox, permitir localhost para callbacks
    if (!isMercadoPagoProduction) {
      resolvedBackUrls.success = process.env.MERCADOPAGO_SUCCESS_URL || `${baseUrl}/payment/success`;
      resolvedBackUrls.failure = process.env.MERCADOPAGO_FAILURE_URL || `${baseUrl}/payment/failure`;
      resolvedBackUrls.pending = process.env.MERCADOPAGO_PENDING_URL || `${baseUrl}/payment/pending`;
    }

    // Validar URLs en producción - Mercado Pago requiere URLs válidas
    const hasInvalidUrls = Object.values(resolvedBackUrls).some(url =>
      !url || (isMercadoPagoProduction && (url.includes('localhost') || url.includes('127.0.0.1')))
    );

    if (isMercadoPagoProduction && hasInvalidUrls) {
      console.warn('Warning: Invalid back_urls detected in production. Mercado Pago may reject the preference.');
      console.warn('Back URLs:', resolvedBackUrls);
    }

    const resolvedNotificationUrl =
      notification_url ?? process.env.MERCADOPAGO_NOTIFICATION_URL ?? `${baseUrl}/api/mercadopago/webhook`;

    const mergedPaymentMethods: PreferenceRequest['payment_methods'] = {
      excluded_payment_methods: payment_methods?.excluded_payment_methods ?? [],
      excluded_payment_types: payment_methods?.excluded_payment_types ?? [],
      installments: payment_methods?.installments ?? 12,
    };

    if (payment_methods?.default_installments != null) {
      mergedPaymentMethods.default_installments = payment_methods.default_installments;
    }

    if (payment_methods?.default_payment_method_id) {
      const isExcluded = (payment_methods.excluded_payment_methods ?? []).some(
        method => method.id === payment_methods.default_payment_method_id
      );

      if (!isExcluded) {
        mergedPaymentMethods.default_payment_method_id = payment_methods.default_payment_method_id;
      }
    }

    // Crear la preferencia de pago con configuración completa
    const defaultCurrencyId = process.env.MERCADOPAGO_CURRENCY_ID ?? 'ARS';

    // Filtrar items que no son productos reales (como recargos)
    const productItems = items.filter((item: any) =>
      !item.id?.includes('mercadopago_surcharge') &&
      !item.title?.includes('Recargo:')
    );

    // Si hay múltiples items, consolidarlos en uno solo con título descriptivo
    let consolidatedItems;
    if (items.length === 1) {
      // Si solo hay un item, usar el título original
      consolidatedItems = items.map((item: any) => ({
        id: item.product_id || item.id,
        title: item.title || item.name || 'Producto',
        description: item.title || item.name || 'Producto de AlgoBonitoSV',
        unit_price: Number(item.price || item.unit_price),
        quantity: Number(item.quantity),
        currency_id: item.currency_id || defaultCurrencyId,
        picture_url: item.picture_url,
        category_id: 'others',
      }));
    } else {
      // Si hay múltiples items, consolidar en uno solo
      const totalAmount = items.reduce((sum: number, item: any) =>
        sum + (Number(item.price || item.unit_price) * Number(item.quantity)), 0
      );

      const productDescriptions = productItems.map((item: any) =>
        `${item.title || item.name || 'Producto'} (x${item.quantity})`
      );

      // Función para balancear líneas - dividir en líneas de aproximadamente 50 caracteres
      const balanceLines = (descriptions: string[]): string => {
        const maxLineLength = 50;
        const lines: string[] = [];
        let currentLine = '';

        for (const desc of descriptions) {
          if (currentLine.length + desc.length + 2 <= maxLineLength) { // +2 por ", "
            currentLine += (currentLine ? ', ' : '') + desc;
          } else {
            if (currentLine) {
              lines.push(currentLine);
            }
            currentLine = desc;
          }
        }

        if (currentLine) {
          lines.push(currentLine);
        }

        return lines.join(',\n');
      };

      const balancedDescriptions = balanceLines(productDescriptions);

      consolidatedItems = [{
        id: 'consolidated_purchase',
        title: `Compra de: ${balancedDescriptions}`,
        description: `Compra de productos: ${balancedDescriptions.replace(',\n', ', ')}`,
        unit_price: totalAmount,
        quantity: 1,
        currency_id: defaultCurrencyId,
        category_id: 'others',
      }];
    }

    const preferenceData: PreferenceRequest = {
      items: consolidatedItems,
      back_urls: resolvedBackUrls,
      notification_url: resolvedNotificationUrl,
      metadata: {
        ...metadata,
        integration_type: 'web',
        created_at: new Date().toISOString(),
        original_items: items, // Mantener los items originales para procesamiento interno
        product_items: productItems, // Items que son productos reales (sin recargos)
        consolidated: items.length > 1, // Indicar si se consolidaron los items
      },
      statement_descriptor: 'Compra en AlgoBonitoSV',
      external_reference: external_reference ?? `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      shipments,
      payment_methods: mergedPaymentMethods,
      expires: false, // La preferencia no expira
      expiration_date_from: undefined,
      expiration_date_to: undefined,
    };

    const shouldEnableAutoReturn = Boolean(
      resolvedBackUrls.success &&
      resolvedBackUrls.success.startsWith('https://') &&
      !resolvedBackUrls.success.includes('localhost') &&
      !resolvedBackUrls.success.includes('127.0.0.1')
    );

    if (shouldEnableAutoReturn) {
      preferenceData.auto_return = 'approved';
    }

    if (payer) {
      preferenceData.payer = {
        name: payer.name,
        email: payer.email,
        phone: payer.phone
          ? {
              area_code: payer.phone.area_code,
              number: payer.phone.number,
            }
          : undefined,
      };
    }

    console.log('Creating preference with data:', JSON.stringify(preferenceData, null, 2));
    console.log('Items being sent to MercadoPago:', JSON.stringify(consolidatedItems, null, 2));

    const result = await preferenceClient.create({ body: preferenceData });

    console.log('Preference created successfully:', result.id);

    return NextResponse.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    });

  } catch (error) {
    console.error('Error creating preference:', error);

    let message = error instanceof Error ? error.message : 'Error interno del servidor';
    const extra: Record<string, unknown> = {};

    if (typeof error === 'object' && error !== null) {
      const maybeResponse = (error as { response?: { status?: number; data?: unknown } }).response;
      if (maybeResponse) {
        extra.mercadoPagoStatus = maybeResponse.status;
        extra.mercadoPagoData = maybeResponse.data;
        console.error('Mercado Pago response error:', maybeResponse.status, maybeResponse.data);
      }
    }

    return NextResponse.json({ error: message, ...extra }, { status: 500 });
  }
}